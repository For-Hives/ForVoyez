// The two flows that spend credits of the subscribed test account: an API key
// used against the public API, and one analysis in the playground. They are
// in one file on purpose: the tests of a file run one after the other in one
// worker, so the credit counts they check cannot be changed by the other one.
// Each one makes ONE real OpenAI call (CI passes OPENAI_API_KEY to the app).
const path = require('node:path')
const fs = require('node:fs')

const { getNextPublicUrl, log } = require('../../tests-helpers')
const { expect, test } = require('../../auth/fixtures')

const IMAGE = path.resolve(__dirname, '../../resources/cat.jpg')
const DEFAULT_FIELDS = ['title', 'alternativeText', 'caption']
const TOKEN_PREFIX = 'e2e-token-'

function expectFilledFields(description) {
	for (const field of DEFAULT_FIELDS) {
		expect(typeof description[field], field).toBe('string')
		expect(description[field].trim().length, field).toBeGreaterThan(0)
	}
}

async function revokeToken(page, name) {
	const row = tokenRows(page, name).first()
	await row.getByRole('button', { name: 'Delete' }).click()
	const dialog = page.getByRole('dialog')
	await expect(dialog.getByText('Revoke secret key')).toBeVisible()
	await dialog.getByRole('button', { name: 'Revoke Key' }).click()
	await expect(page.getByRole('alert').filter({ hasText: 'Token deleted successfully' })).toBeVisible({
		timeout: 20_000,
	})
	await expect(tokenRows(page, name)).toHaveCount(0, { timeout: 20_000 })
}

// The rows of the API key list whose name contains `name`
function tokenRows(page, name) {
	return page.getByRole('row').filter({ hasText: name })
}

// Re-read the live list after each revocation, as the original cleanup did.
async function revokeRemainingTokens(page) {
	if ((await tokenRows(page, TOKEN_PREFIX).count()) === 0) return
	const name = await tokenRows(page, TOKEN_PREFIX).first().getByRole('cell').first().innerText()
	log(`Cleaning up the API key ${name}`)
	await revokeToken(page, name.trim())
	await revokeRemainingTokens(page)
}

test.describe('Credits of the subscribed account', () => {
	test.describe('API key: create, call the API, revoke', () => {
		let api

		test.beforeEach(async ({ playwright }) => {
			// a plain HTTP client, without the browser's Clerk session: the API
			// only knows the API key
			api = await playwright.request.newContext({
				baseURL: getNextPublicUrl(),
			})
		})

		test.afterEach(async ({ page }) => {
			await api.dispose()
			// clean up a key left by a failed run (best effort)
			try {
				await page.goto('/app/tokens')
				await expect(page.getByRole('button', { name: 'Add token' })).toBeVisible({ timeout: 30_000 })
				// the list is loaded by a server action after the page
				await page.waitForTimeout(3000)
				await revokeRemainingTokens(page)
			} catch (error) {
				log(`API key cleanup failed: ${error.message}`)
			}
		})

		function describeImage(token) {
			return api.post('/api/describe', {
				multipart: {
					image: {
						buffer: fs.readFileSync(IMAGE),
						mimeType: 'image/jpeg',
						name: 'cat.jpg',
					},
				},
				headers: { Authorization: `Bearer ${token}` },
				timeout: 60_000,
			})
		}

		async function accountCredits(token) {
			const response = await api.get('/api/tokens', {
				headers: { Authorization: `Bearer ${token}` },
			})
			expect(response.status()).toBe(200)
			const account = await response.json()
			expect(account.success).toBe(true)
			expect(typeof account.user.credits).toBe('number')
			return account
		}

		test('a key created in the dashboard works on the API until it is revoked', async ({ page }) => {
			test.setTimeout(180_000)
			const name = `${TOKEN_PREFIX}${Date.now()}`

			// 1. create the key in /app/tokens and read its value
			await page.goto('/app/tokens')
			await expect(page).toHaveURL('/app/tokens')
			await page.getByRole('button', { name: 'Add token' }).click()
			const dialog = page.getByRole('dialog')
			await expect(dialog.getByText('Create new secret key')).toBeVisible()
			await dialog.getByLabel('Name', { exact: true }).fill(name)
			await dialog.getByRole('button', { name: 'Create Token' }).click()
			const tokenField = dialog.getByLabel('Your New Token')
			await expect(tokenField).toBeVisible({ timeout: 30_000 })
			const token = await tokenField.inputValue()
			expect(token.split('.')).toHaveLength(3)
			await dialog.getByRole('button', { name: 'I copied it' }).click()
			await expect(tokenRows(page, name)).toHaveCount(1, { timeout: 20_000 })
			log(`API key ${name} created`)

			// 2. GET /api/tokens: the account behind the key
			const before = await accountCredits(token)
			expect(before.token.name).toBe(name)
			expect(before.user.credits).toBeGreaterThan(0)
			log(`Credits before: ${before.user.credits}`)

			// 3. POST /api/describe: one real description, one credit
			const described = await describeImage(token)
			expect(described.status()).toBe(200)
			expectFilledFields(await described.json())
			const after = await accountCredits(token)
			expect(after.user.credits).toBe(before.user.credits - 1)

			// 4. revoke the key in the dashboard
			await page.reload()
			await expect(tokenRows(page, name)).toHaveCount(1, { timeout: 30_000 })
			await revokeToken(page, name)
			log(`API key ${name} revoked`)

			// 5. the API refuses it right away, without charging
			const refused = await describeImage(token)
			expect(refused.status()).toBe(401)
			expect(refused.headers()['content-type']).toContain('application/json')
			expect(await refused.json()).toEqual({
				error: 'Unauthorized, invalid token',
			})
			const account = await api.get('/api/tokens', {
				headers: { Authorization: `Bearer ${token}` },
			})
			expect(account.status()).toBe(401)
		})
	})

	test.describe('Playground', () => {
		test('one analysis shows the three fields and costs one credit', async ({ page }) => {
			test.setTimeout(180_000)

			await page.goto('/app/playground')
			await expect(page).toHaveURL('/app/playground')
			const credits = page.getByTestId('user-credits')
			// rendered once the server action answers (a placeholder until then)
			await expect(credits).not.toHaveText('0', { timeout: 30_000 })
			const before = Number(await credits.innerText())
			expect(before).toBeGreaterThan(0)
			log(`Credits before: ${before}`)

			await page.getByTestId('upload-input').setInputFiles(IMAGE)
			await expect(page.getByRole('img', { name: 'Uploaded' })).toBeVisible()
			const analyze = page.getByRole('button', { name: 'Analyze your image' })
			await expect(analyze).toBeEnabled()
			await analyze.click()

			const response = page.getByTestId('response-editor')
			await expect(response).toContainText('"alternativeText"', {
				timeout: 90_000,
			})
			const description = JSON.parse(await response.innerText())
			expectFilledFields(description)

			await expect(credits).toHaveText(String(before - 1), {
				timeout: 30_000,
			})
		})
	})
})
