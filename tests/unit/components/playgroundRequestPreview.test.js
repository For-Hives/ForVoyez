import { forEachInSequence } from '@/helpers/forEachInSequence'
// The playground "Request Preview" code samples: checked with each language's
// own tool, then run against a local server that reads the body the way
// /api/describe does.
// @vitest-environment node

import { execFile, execFileSync } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { getPreviewCode } from '@/components/Playground/GetPreviewCode'
import { defaultJsonTemplateSchema } from '@/constants/playground'

const runFile = promisify(execFile)

const API_URL = 'https://forvoyez.com/api/describe'
const LANGUAGES = ['JavaScript', 'cURL', 'Python', 'PHP', 'HTTP']
const IMAGE_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x0d, 0x0a, 0xff])

// Every language sample is checked and executed. PHP can use the official
// Docker runtime when a native interpreter is unavailable.
function available(command, args) {
	try {
		execFileSync(command, args, { stdio: 'ignore', timeout: 10000 })
		return true
	} catch {
		return false
	}
}

const phpRuntime = available('php', ['-v'])
	? { command: 'php', args: [] }
	: {
			command: 'docker',
			args: [
				'run',
				'--rm',
				'--network',
				'host',
				'-v',
				`${tmpdir()}:${tmpdir()}`,
				'--workdir',
				tmpdir(),
				'php:8.5-cli',
				'php',
			],
		}

const tools = {
	phpCurl: available(phpRuntime.command, [...phpRuntime.args, '-r', 'exit(function_exists("curl_init") ? 0 : 1);']),
	pythonRequests: available('python3', ['-c', 'import requests']),
	python: available('python3', ['--version']),
	bash: available('bash', ['-c', 'true']),
	curl: available('curl', ['--version']),
	php: available(phpRuntime.command, [...phpRuntime.args, '-v']),
}

beforeAll(() => {
	const missing = Object.entries(tools)
		.filter(([, present]) => !present)
		.map(([name]) => name)
	if (missing.length > 0) {
		throw new Error(
			`Missing sample runtimes: ${missing.join(', ')}. Install PHP CLI/cURL, Python requests, bash and curl; or pull php:8.5-cli for the Docker PHP fallback.`
		)
	}
})

// The playground's initial state: nothing typed, no image yet
const emptyForm = {
	jsonSchema: JSON.stringify(defaultJsonTemplateSchema, null, 4),
	languageToTranslate: '',
	keywords: '',
	image: null,
	context: '',
}

// Text that breaks naive quoting in every language: quotes, `;` and `type=`
// (curl -F), a leading @ or < (curl -F), `$` and backticks (shell, PHP),
// backslashes, newlines and non-ASCII.
const trickyForm = {
	jsonSchema: JSON.stringify(
		{
			alternativeText: 'Line one\nline two \\ $x `y`',
			title: 'Short; under 100 chars, it\'s "good"',
			'mot clé': '  Un mot-clé 🐱 ',
		},
		null,
		4
	),
	context: 'It\'s a "quoted" text; type=text/plain, $HOME `date` \\ é 🐱\nsecond line',
	image: new File([IMAGE_BYTES], "cat's photo; v2.png", { type: 'image/png' }),
	keywords: '@cats, <dogs>, 50%',
	languageToTranslate: 'fr-FR',
}

// What the route reads from trickyForm's schema (descriptions are trimmed)
const trickySchema = {
	alternativeText: 'Line one\nline two \\ $x `y`',
	title: 'Short; under 100 chars, it\'s "good"',
	'mot clé': 'Un mot-clé 🐱',
}

const SAMPLE_FILES = {
	JavaScript: 'describe.mjs',
	Python: 'describe.py',
	cURL: 'describe.sh',
	PHP: 'describe.php',
}

// The HTTP sample as a parsed request: CRLF line ends, text in place of the
// binary image data
async function parseHttpSample(code) {
	const separator = code.indexOf('\n\n')
	const [requestLine, ...headerLines] = code.slice(0, separator).split('\n')
	const headers = new Headers(headerLines.map(line => line.split(/: (.*)/s).slice(0, 2)))
	const body = code
		.slice(separator + 2)
		.replace('<binary image data>', 'IMAGE')
		.replace(/\n/g, '\r\n')
	const form = await new Response(body, {
		headers: { 'Content-Type': headers.get('content-type') },
	}).formData()
	return { requestLine, headers, form }
}

// Writes the sample next to the image it uploads, then runs `command` on it
async function runSample(language, code, command, args = []) {
	const dir = await mkdtemp(path.join(tmpdir(), 'forvoyez-preview-'))
	try {
		await writeFile(path.join(dir, trickyForm.image.name), IMAGE_BYTES)
		const file = path.join(dir, SAMPLE_FILES[language])
		await writeFile(file, code)
		const runtimeArgs = command === 'php' ? phpRuntime.args.map(arg => (arg === tmpdir() ? dir : arg)) : []
		return await runFile(command === 'php' ? phpRuntime.command : command, [...runtimeArgs, ...args, file], {
			// the request goes to 127.0.0.1, never through a proxy
			env: { ...process.env, no_proxy: '*', NO_PROXY: '*' },
			timeout: 20000,
			cwd: dir,
		})
	} finally {
		await rm(dir, { recursive: true, force: true })
	}
}

// A text field as the form held it (multipart may send newlines as CRLF)
function text(form, name) {
	return form.get(name)?.replace(/\r\n/g, '\n')
}

describe('getPreviewCode', () => {
	it('returns no code for an unknown language', () => {
		expect(getPreviewCode('Ruby', trickyForm)).toBe('')
		expect(getPreviewCode('constructor', trickyForm)).toBe('')
	})

	it.each(LANGUAGES)('%s: posts every form field to /api/describe with a placeholder API key', language => {
		const code = getPreviewCode(language, trickyForm)

		if (language === 'HTTP') {
			expect(code).toMatch(/^POST \/api\/describe HTTP\/1\.1\nHost: forvoyez\.com\n/)
		} else {
			expect(code).toContain(API_URL)
		}
		expect(code).toContain('Bearer YOUR_API_KEY')
		for (const field of ['image', 'context', 'keywords', 'language']) {
			expect(code).toMatch(new RegExp(`['"]?${field}['"=]`))
		}
		expect(code).toMatch(/['"]?schema['"=]/)
		expect(code).not.toMatch(/undefined|\[object Object\]|Invalid JSON/)
	})

	it('serializes the schema as a JSON string', () => {
		expect(getPreviewCode('JavaScript', trickyForm)).toContain("  'schema',\n  JSON.stringify({\n")
		expect(getPreviewCode('Python', trickyForm)).toContain("    'schema': json.dumps({\n")
		expect(getPreviewCode('PHP', trickyForm)).toContain("        'schema' => json_encode([\n")
		expect(getPreviewCode('cURL', trickyForm)).toContain(
			`--form-string 'schema=${JSON.stringify(trickySchema).replace(/'/g, `'\\''`)}'`
		)
	})

	it('leaves out empty text fields and uses a placeholder image path', () => {
		const code = getPreviewCode('Python', emptyForm)

		expect(code).not.toMatch(/'context'|'keywords'|'language'/)
		expect(code).toContain("with open('/path/to/image.jpg', 'rb') as image:")
		expect(code).toContain("{'image': ('image.jpg', image, 'image/jpeg')}")
	})

	it('sends the default fields for an empty or invalid schema, as the API would use them', async () => {
		await forEachInSequence(['', '{}', 'not json', '[1, 2]'], async jsonSchema => {
			const { form } = await parseHttpSample(getPreviewCode('HTTP', { ...emptyForm, jsonSchema }))

			expect(JSON.parse(form.get('schema'))).toEqual(defaultJsonTemplateSchema)
		})
	})

	it('keeps a schema over the API limits as typed: the API answers 400, like the playground', async () => {
		const tooMany = Object.fromEntries(Array.from({ length: 21 }, (_, index) => [`field${index}`, 'text']))
		const { form } = await parseHttpSample(
			getPreviewCode('HTTP', {
				...emptyForm,
				jsonSchema: JSON.stringify(tooMany),
			})
		)

		expect(JSON.parse(form.get('schema'))).toEqual(tooMany)
	})
})

describe('the samples are valid code', () => {
	const forms = { tricky: trickyForm, empty: emptyForm }

	for (const [name, form] of Object.entries(forms)) {
		it(`JavaScript passes node --check (${name} form)`, async () => {
			await expect(
				runSample('JavaScript', getPreviewCode('JavaScript', form), process.execPath, ['--check'])
			).resolves.toBeDefined()
		})

		it(`cURL passes bash -n (${name} form)`, async () => {
			await expect(runSample('cURL', getPreviewCode('cURL', form), 'bash', ['-n'])).resolves.toBeDefined()
		})

		it(`Python parses (${name} form)`, async () => {
			await expect(
				runSample('Python', getPreviewCode('Python', form), 'python3', [
					'-c',
					'import ast, sys; ast.parse(open(sys.argv[1], encoding="utf-8").read())',
				])
			).resolves.toBeDefined()
		})

		it(`PHP passes php -l (${name} form)`, async () => {
			const { stdout } = await runSample('PHP', getPreviewCode('PHP', form), 'php', ['-l'])

			expect(stdout).toContain('No syntax errors detected')
		})
	}

	it('HTTP is a well-formed multipart/form-data request', async () => {
		const { requestLine, headers, form } = await parseHttpSample(getPreviewCode('HTTP', trickyForm))

		expect(requestLine).toBe('POST /api/describe HTTP/1.1')
		expect(headers.get('authorization')).toBe('Bearer YOUR_API_KEY')
		expect(form.get('image').name).toBe(trickyForm.image.name)
		expect(text(form, 'context')).toBe(trickyForm.context)
		expect(text(form, 'keywords')).toBe(trickyForm.keywords)
		expect(text(form, 'language')).toBe(trickyForm.languageToTranslate)
		expect(JSON.parse(form.get('schema'))).toEqual(trickySchema)
	})
})

// Each sample, run with its real tool against a local server that reads the
// body the way the describe route does (request.formData())
describe('the samples send what /api/describe reads', { timeout: 30000 }, () => {
	let server
	let localUrl
	let received

	beforeAll(async () => {
		server = createServer(async (request, response) => {
			const chunks = []
			for await (const chunk of request) {
				chunks.push(chunk)
			}
			received = {
				form: await new Response(Buffer.concat(chunks), {
					headers: { 'Content-Type': request.headers['content-type'] ?? '' },
				})
					.formData()
					.catch(error => error),
				authorization: request.headers.authorization,
				contentType: request.headers['content-type'],
				method: request.method,
				url: request.url,
			}
			response.writeHead(200, { 'Content-Type': 'application/json' })
			response.end('{"title":"A cat"}')
		})
		await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
		localUrl = `http://127.0.0.1:${server.address().port}/api/describe`
	})

	afterAll(() => new Promise(resolve => server.close(resolve)))

	// The sample with the local server in place of forvoyez.com
	async function send(language, form, command, args = []) {
		const code = getPreviewCode(language, form)
		expect(code).toContain(API_URL)
		const localCode = code.replaceAll(API_URL, localUrl)
		expect(localCode).not.toContain('forvoyez.com')

		received = undefined
		await runSample(language, localCode, command, args)
		expect(received).toBeDefined()
		expect(received.form).toBeInstanceOf(FormData)
		return received
	}

	async function expectTrickyRequest({ authorization, contentType, method, form, url }) {
		expect(method).toBe('POST')
		expect(url).toBe('/api/describe')
		expect(authorization).toBe('Bearer YOUR_API_KEY')
		expect(contentType).toMatch(/^multipart\/form-data; ?boundary=/)
		expect([...new Set(form.keys())].sort()).toEqual(['context', 'image', 'keywords', 'language', 'schema'])

		const image = form.get('image')
		expect(typeof image).not.toBe('string')
		expect(image.name).toBe(trickyForm.image.name)
		expect(Buffer.from(await image.arrayBuffer())).toEqual(IMAGE_BYTES)

		expect(text(form, 'context')).toBe(trickyForm.context)
		expect(text(form, 'keywords')).toBe(trickyForm.keywords)
		expect(text(form, 'language')).toBe(trickyForm.languageToTranslate)
		expect(JSON.parse(form.get('schema'))).toEqual(trickySchema)
	}

	it('JavaScript (Node.js fetch)', async () => {
		await expectTrickyRequest(await send('JavaScript', trickyForm, process.execPath))
	})

	it('JavaScript keeps a "__proto__" key as a schema field', async () => {
		const { form } = await send(
			'JavaScript',
			{ ...trickyForm, jsonSchema: '{"__proto__": "x", "title": "y"}' },
			process.execPath
		)

		expect(form.get('schema')).toBe('{"__proto__":"x","title":"y"}')
	})

	it('cURL', async () => {
		await expectTrickyRequest(await send('cURL', trickyForm, 'bash'))
	})

	it('Python (requests)', async () => {
		await expectTrickyRequest(await send('Python', trickyForm, 'python3'))
	})

	it('PHP (curl extension)', async () => {
		await expectTrickyRequest(await send('PHP', trickyForm, 'php'))
	})

	it('PHP sends schema keys "0", "1"... as a JSON object', async () => {
		const { form } = await send('PHP', { ...trickyForm, jsonSchema: '{"0": "First field", "1": "Second"}' }, 'php')

		expect(JSON.parse(form.get('schema'))).toEqual({
			0: 'First field',
			1: 'Second',
		})
	})
})
