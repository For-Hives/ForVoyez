import {
	CodeBracketIcon,
	CommandLineIcon,
	GlobeAltIcon,
	LanguageIcon,
	PhotoIcon,
	PuzzlePieceIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { getDevelopersSampleCode } from '@/components/Landing/Developers/DevelopersSample'

// Copy rule for this section: the service writes the texts FROM THE IMAGE in
// the requested language. It does not rewrite an alt text that already exists,
// and the plugin has one language setting for the whole site.
const WORDPRESS_POINTS = [
	{
		name: 'Up and running without code',
		description:
			'Install the plugin, paste your ForVoyez API key into its settings, and generate from your media library.',
		icon: PuzzlePieceIcon,
	},
	{
		name: "Written in your site's language",
		description:
			'Set the language once in the plugin settings. Each description is generated from the image, directly in that language.',
		icon: LanguageIcon,
	},
	{
		name: 'Existing images and new uploads',
		description:
			'Generate descriptions in bulk for the images you already have, and turn on automatic generation for new uploads.',
		icon: PhotoIcon,
	},
]

const API_POINTS = [
	{
		name: 'One endpoint',
		description: (
			<>
				Send a <Field>POST</Field> to <Field>/api/describe</Field> as <Field>multipart/form-data</Field>, with your API
				key as a Bearer token. JPEG, PNG, WebP, and non-animated GIF, up to 10 MB.
			</>
		),
		icon: CommandLineIcon,
	},
	{
		name: 'The language you ask for',
		description: (
			<>
				Pass a language code or name in the <Field>language</Field> field. Call the API once per language to produce
				multilingual alt text.
			</>
		),
		icon: GlobeAltIcon,
	},
	{
		name: 'Your own JSON fields',
		description: (
			<>
				Describe the fields you want in <Field>schema</Field> and get flat JSON back with exactly those keys. Add
				optional <Field>context</Field> and <Field>keywords</Field> to guide the result.
			</>
		),
		icon: CodeBracketIcon,
	},
]

// The command or option that opens each line of the cURL sample
const LEADING_TOKEN = /^(\s*)(\S+)(.*)$/

// Same card as the pricing plans. `min-w-0`: the request sample scrolls inside
// its own box instead of widening the grid on a phone.
const CARD = 'flex min-w-0 flex-col rounded-3xl p-8 ring-1 ring-slate-200 xl:p-10'

export function DevelopersComponent() {
	return (
		<section
			aria-labelledby="developers-heading"
			className="py-24 sm:py-32"
			data-testid="developers-section"
			id="developers"
		>
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<div className="mx-auto max-w-2xl lg:text-center">
					<h2 className="text-forvoyez_orange-500 text-base leading-7 font-semibold" id="developers-heading">
						Plugin and API
					</h2>
					<p
						className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
						data-testid="developers-title"
					>
						One alt text engine. Two ways to use it.
					</p>
					<p className="mt-6 text-lg leading-8 text-slate-600" data-testid="developers-description">
						Use the plugin to generate image descriptions from your WordPress dashboard, or call the same API from your
						own code. Both use the same ForVoyez credits.
					</p>
				</div>
				{/* 3:5 on lg, 1:2 from xl: the two cards are about as tall as each other and line up with the pricing cards below. */}
				<div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:max-w-none lg:grid-cols-8 xl:grid-cols-3">
					<div className={`${CARD} lg:col-span-3 xl:col-span-1`} data-testid="developers-wordpress">
						<h3 className="text-2xl leading-8 font-bold tracking-tight text-slate-900">AI-ready for WordPress</h3>
						<p className="mt-4 text-base leading-7 text-slate-600">
							Alt text, titles, and captions generated for your images, in your site&apos;s language. No code and no
							prompt to write.
						</p>
						<Points points={WORDPRESS_POINTS} />
						<div className="mt-auto pt-8">
							<p className="text-sm leading-6 text-slate-500">
								The plugin is free to install. Generating descriptions uses the credits in your ForVoyez plan.
							</p>
							<Link
								className="text-forvoyez_orange-500 ring-forvoyez_orange-500/20 focus-visible:outline-forvoyez_orange-500 mt-6 inline-block rounded-md px-3.5 py-2.5 text-sm font-semibold ring-1 ring-inset hover:ring-[#e05d45]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
								data-fv-event="developers-cta-click"
								data-fv-event-target="plugin"
								data-testid="developers-plugin-link"
								href="/wordpress-plugin"
							>
								See the WordPress plugin
							</Link>
						</div>
					</div>
					<div className={`${CARD} lg:col-span-5 xl:col-span-2`} data-testid="developers-api">
						<h3 className="text-2xl leading-8 font-bold tracking-tight text-slate-900">Developer API</h3>
						<p className="mt-4 text-base leading-7 text-slate-600">
							Not on WordPress, or building your own workflow? Send an image over HTTPS and get its title, alternative
							text, and caption back as JSON.
						</p>
						<Points points={API_POINTS} />
						<CodeSample code={getDevelopersSampleCode()} />
						<div className="mt-auto pt-8">
							<p className="text-sm leading-6 text-slate-500">
								One credit per successfully processed image, whether you call the API or use the playground.
							</p>
							<div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
								<Link
									className="bg-forvoyez_orange-500 hover:bg-forvoyez_orange-600 focus-visible:outline-forvoyez_orange-500 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
									data-fv-event="developers-cta-click"
									data-fv-event-target="docs"
									data-testid="developers-docs-link"
									href="https://doc.forvoyez.com/"
								>
									Read the API docs
								</Link>
								<Link
									className="text-sm leading-6 font-semibold text-slate-900"
									data-fv-event="developers-cta-click"
									data-fv-event-target="playground"
									data-testid="developers-playground-link"
									href="/app/playground"
								>
									Try the playground <span aria-hidden="true">→</span>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

// Same list pattern as the Features section: icon in the margin, name, text.
function Points({ points }) {
	return (
		<dl className="mt-8 space-y-6 text-base leading-7 text-slate-600">
			{points.map(point => (
				<div className="relative pl-9" key={point.name}>
					<dt className="font-semibold text-slate-900">
						<point.icon aria-hidden="true" className="text-forvoyez_orange-500 absolute top-1 left-1 h-5 w-5" />
						{point.name}
					</dt>
					<dd>{point.description}</dd>
				</div>
			))}
		</dl>
	)
}

// A request field or path named in the text
function Field({ children }) {
	return <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-sm text-slate-800">{children}</code>
}

// Every element sets its own font here: the global `*` rule gives each span
// the body font, so `font-mono` on the <pre> alone is not inherited.
function CodeSample({ code }) {
	return (
		<figure className="mt-8 overflow-hidden rounded-xl bg-slate-900">
			<figcaption className="flex items-center justify-between gap-x-4 border-b border-white/10 px-4 py-2 text-xs text-slate-400">
				<span className="font-mono">POST /api/describe</span>
				<span>cURL</span>
			</figcaption>
			<pre
				className="overflow-x-auto p-4 font-mono text-xs leading-6 text-slate-100 [&_*]:font-mono"
				data-testid="developers-code-sample"
			>
				<code>
					{code.split('\n').map(line => {
						const [, indent = '', token = line, rest = ''] = line.match(LEADING_TOKEN) ?? []
						return (
							<span key={line}>
								{indent}
								<span className="text-forvoyez_orange-300">{token}</span>
								{rest}
								{'\n'}
							</span>
						)
					})}
				</code>
			</pre>
		</figure>
	)
}
