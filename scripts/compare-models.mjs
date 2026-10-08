#!/usr/bin/env node
// Runs the previous 3-call image description pipeline
// (scripts/legacy-image-description.mjs) and the current single-call one
// (src/services/imageDescription.service.js) on every image of a folder, then
// writes a side-by-side report (JSON + Markdown) with the outputs, the token
// usage and the latency. It calls the OpenAI API: every image costs 4 calls.
//
//   node --env-file=.env scripts/compare-models.mjs <images-folder> [options]
//
// Run with --help for the options. Images are processed one at a time, with
// the same preprocessing as the app (blobToBase64: WebP, at most 1000px).
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { register } from 'node:module'
import { parseArgs } from 'node:util'
import path from 'node:path'

// `@/…` imports of the app code (static imports would load before this)
register('./lib/src-alias-hooks.mjs', import.meta.url)

const USAGE = `Usage: node --env-file=.env scripts/compare-models.mjs <images-folder> [options]

Needs OPENAI_API_KEY. Accepted images: .jpg .jpeg .png .webp .gif

Options:
  --out <dir>           report folder (default: compare-models-report)
  --model <id>          new pipeline model (default: FORVOYEZ_AI_MODEL or gpt-6-luna)
  --legacy-model <id>   previous pipeline model (default: gpt-4o-mini)
  --detail <level>      new pipeline image detail: low, high or auto
                        (default: FORVOYEZ_AI_IMAGE_DETAIL or low)
  --context <text>      context sent with every image
  --keywords <text>     keywords sent with every image
  --language <lang>     output language (default: en)
  --schema <json>       flat JSON map key -> description (default: title,
                        alternativeText, caption)
  --limit <n>           only the first n images (sorted by name)
  -h, --help            show this help`

const MEDIA_TYPES = {
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
}

async function main() {
	const { positionals, values } = parseArgs({
		options: {
			out: { default: 'compare-models-report', type: 'string' },
			'legacy-model': { type: 'string' },
			help: { type: 'boolean', short: 'h' },
			language: { default: 'en', type: 'string' },
			keywords: { default: '', type: 'string' },
			context: { default: '', type: 'string' },
			schema: { type: 'string' },
			detail: { type: 'string' },
			model: { type: 'string' },
			limit: { type: 'string' },
		},
		allowPositionals: true,
	})

	if (values.help || positionals.length !== 1) {
		console.info(USAGE)
		return values.help ? 0 : 1
	}
	if (!process.env.OPENAI_API_KEY) {
		console.error('OPENAI_API_KEY is not set (try node --env-file=.env ...)')
		return 1
	}

	// the service reads its settings from the environment at call time
	if (values.model) process.env.FORVOYEZ_AI_MODEL = values.model
	if (values.detail) process.env.FORVOYEZ_AI_IMAGE_DETAIL = values.detail

	const { blobToBase64, DEFAULT_AI_MODEL, generateImageMetadata } =
		await import('../src/services/imageDescription.service.js')
	const { LEGACY_AI_MODEL, legacyGenerateImageMetadata } =
		await import('./legacy-image-description.mjs')

	const folder = path.resolve(positionals[0])
	const files = (await readdir(folder))
		.filter(file => MEDIA_TYPES[path.extname(file).toLowerCase()])
		.sort()
		.slice(0, values.limit ? Number(values.limit) : undefined)
	if (files.length === 0) {
		console.error(`No .jpg/.jpeg/.png/.webp/.gif image in ${folder}`)
		return 1
	}

	const settings = {
		newDetail: process.env.FORVOYEZ_AI_IMAGE_DETAIL || 'low',
		newModel: process.env.FORVOYEZ_AI_MODEL || DEFAULT_AI_MODEL,
		legacyModel: values['legacy-model'] || LEGACY_AI_MODEL,
		schema: values.schema ? JSON.parse(values.schema) : {},
		language: values.language,
		keywords: values.keywords,
		context: values.context,
	}
	const data = {
		language: settings.language,
		keywords: settings.keywords,
		context: settings.context,
		schema: settings.schema,
	}

	const images = []
	for (const [index, file] of files.entries()) {
		console.info(`[${index + 1}/${files.length}] ${file}`)
		const entry = { file }
		try {
			const bytes = await readFile(path.join(folder, file))
			const type = MEDIA_TYPES[path.extname(file).toLowerCase()]
			const base64Image = await blobToBase64(new Blob([bytes], { type }))

			entry.legacy = await timed(() =>
				legacyGenerateImageMetadata(base64Image, data, {
					model: settings.legacyModel,
				})
			)
			entry.new = await timed(() => generateImageMetadata(base64Image, data))
		} catch (error) {
			entry.error = describeError(error)
		}
		images.push(entry)
	}

	const report = {
		summary: {
			legacy: summarize(images, 'legacy'),
			new: summarize(images, 'new'),
		},
		generatedAt: new Date().toISOString(),
		folder,
		settings,
		images,
	}

	const out = path.resolve(values.out)
	await mkdir(out, { recursive: true })
	await writeFile(
		path.join(out, 'report.json'),
		`${JSON.stringify(report, null, 2)}\n`
	)
	await writeFile(path.join(out, 'report.md'), toMarkdown(report))
	console.info(`Report written to ${out}/report.md and ${out}/report.json`)
	return 0
}

// Wall-clock latency around the whole pipeline, same measure for both.
async function timed(run) {
	const startedAt = Date.now()
	try {
		const result = await run()
		return { ...result, latencyMs: Date.now() - startedAt }
	} catch (error) {
		return { error: describeError(error), latencyMs: Date.now() - startedAt }
	}
}

function describeError(error) {
	return `${error?.name ?? 'Error'}: ${error?.message ?? error}`
}

function summarize(images, pipeline) {
	const runs = images.map(image => image[pipeline]).filter(Boolean)
	const succeeded = runs.filter(run => !run.error)
	const total = key =>
		succeeded.reduce((sum, run) => sum + (run.usage?.[key] ?? 0), 0)
	const average = value =>
		succeeded.length ? Math.round(value / succeeded.length) : null

	return {
		averageLatencyMs: average(
			succeeded.reduce((sum, run) => sum + run.latencyMs, 0)
		),
		averageOutputTokens: average(total('outputTokens')),
		averageInputTokens: average(total('inputTokens')),
		totalOutputTokens: total('outputTokens'),
		totalInputTokens: total('inputTokens'),
		failed: runs.length - succeeded.length,
		succeeded: succeeded.length,
	}
}

function toMarkdown(report) {
	const { settings, summary } = report
	const lines = [
		'# Image description: previous vs new pipeline',
		'',
		`Generated ${report.generatedAt} from \`${report.folder}\` (${report.images.length} images).`,
		'',
		`- Previous: \`${settings.legacyModel}\`, 3 calls per image (context cleanup, vision description, JSON metadata)`,
		`- New: \`${settings.newModel}\`, 1 vision call with structured output, image detail \`${settings.newDetail}\``,
		`- Language \`${settings.language}\`, context ${settings.context ? `"${cell(settings.context)}"` : 'none'}, keywords ${settings.keywords ? `"${cell(settings.keywords)}"` : 'none'}`,
		'',
		'## Summary',
		'',
		'| Pipeline | OK | Failed | Avg latency (ms) | Avg input tokens | Avg output tokens | Total input tokens | Total output tokens |',
		'| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
		...[
			['Previous', summary.legacy],
			['New', summary.new],
		].map(
			([name, row]) =>
				`| ${name} | ${row.succeeded} | ${row.failed} | ${row.averageLatencyMs ?? '-'} | ${row.averageInputTokens ?? '-'} | ${row.averageOutputTokens ?? '-'} | ${row.totalInputTokens} | ${row.totalOutputTokens} |`
		),
		'',
		'## Images',
	]

	for (const image of report.images) {
		lines.push('', `### ${image.file}`, '')
		if (image.error) {
			lines.push(`Skipped: ${cell(image.error)}`)
			continue
		}
		const fields = [
			...new Set([
				...Object.keys(image.legacy?.metadata ?? {}),
				...Object.keys(image.new?.metadata ?? {}),
			]),
		]
		lines.push(
			'| | Previous | New |',
			'| --- | --- | --- |',
			...fields.map(
				field =>
					`| **${cell(field)}** | ${cell(image.legacy?.metadata?.[field])} | ${cell(image.new?.metadata?.[field])} |`
			),
			`| Error | ${cell(image.legacy?.error)} | ${cell(image.new?.error)} |`,
			`| Tokens (input / output) | ${tokens(image.legacy)} | ${tokens(image.new)} |`,
			`| Latency (ms) | ${image.legacy?.latencyMs ?? ''} | ${image.new?.latencyMs ?? ''} |`
		)
	}

	return `${lines.join('\n')}\n`
}

function tokens(run) {
	if (!run?.usage) return ''
	return `${run.usage.inputTokens ?? '?'} / ${run.usage.outputTokens ?? '?'}`
}

// One Markdown table cell: no pipes, no line breaks.
function cell(value) {
	return String(value ?? '')
		.replaceAll('|', '\\|')
		.replace(/\s*\n\s*/g, ' ')
}

// exit right away (idle keep-alive sockets would hold the process open)
main().then(
	code => process.exit(code),
	error => {
		console.error(error)
		process.exit(1)
	}
)
