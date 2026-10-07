// What actually goes over the wire to OpenAI: the real @ai-sdk/openai
// provider runs, `fetch` is stubbed (no network, fake key).
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getImageDescription } from '@/services/imageDescription.service'

const IMAGE = 'aW1hZ2UtYnl0ZXM='

function responsesApiAnswer(object, model) {
	return {
		output: [
			{
				content: [
					{
						text: JSON.stringify(object),
						type: 'output_text',
						annotations: [],
					},
				],
				status: 'completed',
				role: 'assistant',
				type: 'message',
				id: 'msg_test',
			},
		],
		usage: {
			output_tokens_details: { reasoning_tokens: 0 },
			input_tokens_details: { cached_tokens: 0 },
			total_tokens: 540,
			output_tokens: 40,
			input_tokens: 500,
		},
		incomplete_details: null,
		created_at: 1760000000,
		status: 'completed',
		object: 'response',
		id: 'resp_test',
		model,
	}
}

describe('OpenAI request built by the image description service', () => {
	let requests
	let consoleWarn

	beforeEach(() => {
		requests = []
		vi.stubEnv('OPENAI_API_KEY', 'sk-test-not-a-real-key')
		vi.spyOn(console, 'info').mockImplementation(() => {})
		consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		vi.stubGlobal(
			'fetch',
			vi.fn(async (url, init) => {
				const body = JSON.parse(init.body)
				requests.push({ url: String(url), body })
				return Response.json(
					responsesApiAnswer(
						{ alternativeText: 'Alt', caption: 'Caption', title: 'Title' },
						body.model
					)
				)
			})
		)
	})

	afterEach(() => {
		vi.unstubAllEnvs()
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
	})

	it('asks gpt-5.6-luna for a strict JSON schema, without reasoning, with a low-detail image', async () => {
		const result = await getImageDescription(IMAGE, {
			context: 'A ballet',
			language: 'fr',
		})

		expect(result).toEqual({
			alternativeText: 'Alt',
			caption: 'Caption',
			title: 'Title',
		})
		expect(requests).toHaveLength(1)
		const [{ body, url }] = requests
		expect(url).toBe('https://api.openai.com/v1/responses')
		expect(body).toMatchObject({
			text: {
				format: {
					schema: {
						additionalProperties: false,
						type: 'object',
					},
					name: 'image_metadata',
					type: 'json_schema',
					strict: true,
				},
			},
			reasoning: { effort: 'none' },
			max_output_tokens: 2000,
			model: 'gpt-5.6-luna',
			temperature: 0.3,
			store: false,
		})
		expect(body.text.format.schema.required.sort()).toEqual([
			'alternativeText',
			'caption',
			'title',
		])

		const [instructions, user] = body.input
		expect(instructions.role).toBe('developer')
		expect(user.role).toBe('user')
		expect(user.content).toContainEqual({
			image_url: `data:image/webp;base64,${IMAGE}`,
			type: 'input_image',
			detail: 'auto',
		})
		expect(consoleWarn).not.toHaveBeenCalled()
	})

	it('still works, without warnings, after a rollback to gpt-4o-mini', async () => {
		vi.stubEnv('FORVOYEZ_AI_MODEL', 'gpt-4o-mini')

		const result = await getImageDescription(IMAGE, {})

		expect(result.title).toBe('Title')
		const [{ body }] = requests
		expect(body.model).toBe('gpt-4o-mini')
		expect(body.temperature).toBe(0.3)
		expect(body.reasoning).toBeUndefined()
		expect(body.text.format.type).toBe('json_schema')
		expect(body.input[0].role).toBe('system')
		expect(consoleWarn).not.toHaveBeenCalled()
	})
})
