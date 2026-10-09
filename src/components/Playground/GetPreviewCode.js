const JS_IDENTIFIER = /^[A-Za-z_$][\w$]*$/

import { normalizeDescribeSchema } from '@/helpers/describeInput'

// The playground "Request Preview": the same describe request, made with one
// of the customer's API keys from their own server. Every sample sends
// multipart/form-data with the fields the route reads (image, context,
// keywords, language, and schema as a JSON string). Form text is escaped for
// each language, so quotes, newlines or `$` reach the API unchanged.

const API_URL = 'https://forvoyez.com/api/describe'
const AUTHORIZATION = 'Bearer YOUR_API_KEY'
const NO_IMAGE_PATH = '/path/to/image.jpg'
const BOUNDARY = 'ForVoyezFormBoundary'

/**
 * The code of the playground request in one preview language.
 * @param {string} language - 'JavaScript', 'cURL', 'Python', 'PHP' or 'HTTP'
 * @param {{ image?: File|null, context?: string, keywords?: string, languageToTranslate?: string, jsonSchema?: string }} formData - the playground form
 * @returns {string} the code, '' for an unknown language
 */
export function getPreviewCode(language, formData) {
	const request = describeRequest(formData)
	switch (language) {
		case 'cURL':
			return curlSample(request)
		case 'HTTP':
			return httpSample(request)
		case 'JavaScript':
			return javascriptSample(request)
		case 'PHP':
			return phpSample(request)
		case 'Python':
			return pythonSample(request)
		default:
			return ''
	}
}

function basename(path) {
	return path.split('/').pop()
}

// --form-string sends the text as is: with -F, curl reads a value starting
// with @ or < as a file and cuts it at the first ";".
function curlSample({ imagePath, imageType, fields, schema }) {
	const imagePart = `image=@"${imagePath.replace(/[\\"]/g, '\\$&')}";type=${imageType}`
	return [
		`curl -X POST ${shellQuote(API_URL)}`,
		`  -H ${shellQuote(`Authorization: ${AUTHORIZATION}`)}`,
		`  -F ${shellQuote(imagePart)}`,
		...fields.map(([name, value]) => `  --form-string ${shellQuote(`${name}=${value}`)}`),
		`  --form-string ${shellQuote(`schema=${JSON.stringify(schema)}`)}`,
	].join(' \\\n')
}

// The text fields the playground sends (empty ones are left out: the API
// then uses its defaults) and the schema the API will answer with
function describeRequest({ languageToTranslate, jsonSchema, keywords, context, image } = {}) {
	return {
		fields: [
			['context', context],
			['keywords', keywords],
			['language', languageToTranslate],
		].filter(([, value]) => typeof value === 'string' && value.trim() !== ''),
		imagePath: image?.name || NO_IMAGE_PATH,
		imageType: image?.type || 'image/jpeg',
		schema: describeSchema(jsonSchema),
	}
}

// The route's own normalization (an empty or invalid schema means the default
// fields), so the sample gets the same answer as the playground. A schema
// over the limits is kept as typed: the API refuses it with a 400 too.
function describeSchema(jsonSchema) {
	try {
		return normalizeDescribeSchema(jsonSchema)
	} catch {
		return Object.fromEntries(Object.entries(JSON.parse(jsonSchema)).map(([key, value]) => [key, String(value ?? '')]))
	}
}

function httpSample({ imagePath, imageType, fields, schema }) {
	// a file name escaped as browsers send it
	const fileName = basename(imagePath).replace(/["\r\n]/g, encodeURIComponent)
	const part = (name, value) => [`--${BOUNDARY}`, `Content-Disposition: form-data; name="${name}"`, '', value]
	return [
		'POST /api/describe HTTP/1.1',
		'Host: forvoyez.com',
		`Authorization: ${AUTHORIZATION}`,
		`Content-Type: multipart/form-data; boundary=${BOUNDARY}`,
		'',
		`--${BOUNDARY}`,
		`Content-Disposition: form-data; name="image"; filename="${fileName}"`,
		`Content-Type: ${imageType}`,
		'',
		'<binary image data>',
		...fields.flatMap(([name, value]) => part(name, value)),
		...part('schema', JSON.stringify(schema, null, 2)),
		`--${BOUNDARY}--`,
	].join('\n')
}

function javascriptSample({ imagePath, imageType, fields, schema }) {
	return [
		'// Node.js 18+, as an ES module (e.g. describe.mjs). Run it on your server:',
		'// never send your API key to the browser.',
		"import { readFile } from 'node:fs/promises'",
		'',
		'const form = new FormData()',
		'form.append(',
		"  'image',",
		`  new Blob([await readFile(${quote(imagePath)})], { type: ${quote(imageType)} }),`,
		`  ${quote(basename(imagePath))}`,
		')',
		...fields.map(([name, value]) => `form.append(${quote(name)}, ${quote(value)})`),
		'form.append(',
		"  'schema',",
		'  JSON.stringify({',
		...Object.entries(schema).map(([key, value]) => `    ${jsKey(key)}: ${quote(value)},`),
		'  })',
		')',
		'',
		`const response = await fetch(${quote(API_URL)}, {`,
		"  method: 'POST',",
		`  headers: { Authorization: ${quote(AUTHORIZATION)} },`,
		'  body: form,',
		'})',
		'console.log(await response.json())',
	].join('\n')
}

// A bare key when it is an identifier. "__proto__" stays computed: written
// as a plain key, an object literal makes it the prototype, not a field.
function jsKey(key) {
	if (key === '__proto__') {
		return `[${quote(key)}]`
	}
	return JS_IDENTIFIER.test(key) ? key : quote(key)
}

// PHP single quotes only know the \\ and \' escapes
function phpQuote(text) {
	return `'${text.replace(/[\\']/g, '\\$&')}'`
}

// An array as CURLOPT_POSTFIELDS makes curl send multipart/form-data.
// JSON_FORCE_OBJECT: PHP turns keys "0", "1"... into integers, json_encode
// would then write a JSON array, and the API needs an object.
function phpSample({ imagePath, imageType, fields, schema }) {
	return [
		'<?php',
		`$curl = curl_init(${phpQuote(API_URL)});`,
		'curl_setopt_array($curl, [',
		'    CURLOPT_POST => true,',
		'    CURLOPT_RETURNTRANSFER => true,',
		`    CURLOPT_HTTPHEADER => [${phpQuote(`Authorization: ${AUTHORIZATION}`)}],`,
		'    CURLOPT_POSTFIELDS => [',
		`        'image' => new CURLFile(${phpQuote(imagePath)}, ${phpQuote(imageType)}),`,
		...fields.map(([name, value]) => `        ${phpQuote(name)} => ${phpQuote(value)},`),
		"        'schema' => json_encode([",
		...Object.entries(schema).map(([key, value]) => `            ${phpQuote(key)} => ${phpQuote(value)},`),
		'        ], JSON_FORCE_OBJECT),',
		'    ],',
		']);',
		'',
		'$response = curl_exec($curl);',
		'echo $response;',
	].join('\n')
}

function pythonSample({ imagePath, imageType, fields, schema }) {
	return [
		'import json',
		'',
		'import requests',
		'',
		`url = ${quote(API_URL)}`,
		`headers = {'Authorization': ${quote(AUTHORIZATION)}}`,
		'data = {',
		...fields.map(([name, value]) => `    ${quote(name)}: ${quote(value)},`),
		"    'schema': json.dumps({",
		...Object.entries(schema).map(([key, value]) => `        ${quote(key)}: ${quote(value)},`),
		'    }),',
		'}',
		'',
		`with open(${quote(imagePath)}, 'rb') as image:`,
		`    files = {'image': (${quote(basename(imagePath))}, image, ${quote(imageType)})}`,
		'    response = requests.post(url, headers=headers, data=data, files=files)',
		'',
		'print(response.json())',
	].join('\n')
}

// A single-quoted JavaScript or Python string: JSON escapes mean the same in
// both languages.
function quote(text) {
	const escaped = JSON.stringify(text).slice(1, -1).replace(/\\"/g, '"').replace(/'/g, "\\'")
	return `'${escaped}'`
}

function shellQuote(text) {
	return `'${text.replace(/'/g, `'\\''`)}'`
}
