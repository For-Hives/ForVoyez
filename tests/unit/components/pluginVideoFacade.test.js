// The demo video of /wordpress-plugin used to be a YouTube iframe: YouTube and
// DoubleClick loaded, and set cookies, for every visitor of the page, and
// nothing said whether the video was played. It is now a local thumbnail with
// a play button; the player is only requested on that click, which is counted.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { useAuth } from '@clerk/nextjs'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createElement } from 'react'
import sharp from 'sharp'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PrivacyPolicyPage from '@/app/(dashboard)/app/legals/privacy-policy/page'
import { AnalyticsEventsComponent } from '@/components/Analytics/AnalyticsEvents.component'
import { HowItWorksComponent } from '@/components/WordpressPlugin/HowItWorks.component'
import { PluginVideoComponent } from '@/components/WordpressPlugin/PluginVideo.component'
import { setSignedIn } from '@/helpers/analytics'

vi.mock('@clerk/nextjs', () => ({ useAuth: vi.fn() }))

const ROOT = process.cwd()
const SOURCE_DIRECTORY = path.join(ROOT, 'src')
const FACADE_FILE = path.join('components', 'WordpressPlugin', 'PluginVideo.component.js')

const PLAY_BUTTON = 'Play the ForVoyez WordPress plugin demo'
const PLAYER_TITLE = 'ForVoyez WordPress Plugin Demo'
const PLAYER_URL = 'https://www.youtube-nocookie.com/embed/tY-C1fPhCtE?autoplay=1'
const POSTER = '/images/wordpress-plugin/plugin-demo-poster.webp'

// hosts the old iframe made every visitor of the page contact
const THIRD_PARTY_HOSTS = /youtube|ytimg|youtu\.be|google|doubleclick|ggpht/i

const sources = readdirSync(SOURCE_DIRECTORY, { recursive: true, withFileTypes: true })
	.filter(entry => entry.isFile() && /\.(js|jsx|mjs|ts|tsx|css)$/.test(entry.name))
	.map(entry => path.join(entry.parentPath, entry.name))
	.filter(file => !file.startsWith(path.join(SOURCE_DIRECTORY, 'generated')))
	.map(file => ({ content: readFileSync(file, 'utf8'), file: path.relative(SOURCE_DIRECTORY, file) }))

function playButton() {
	return screen.getByRole('button', { name: PLAY_BUTTON })
}

function player() {
	return screen.queryByTitle(PLAYER_TITLE)
}

beforeEach(() => {
	// Clerk has not answered yet
	useAuth.mockReturnValue({ isLoaded: false, isSignedIn: undefined })
	window.umami = { track: vi.fn() }
})

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
	delete window.umami
	setSignedIn(undefined)
})

describe('plugin demo video before the visitor plays it', () => {
	it('puts no iframe and no YouTube or Google address in the page', () => {
		const { container } = render(createElement(HowItWorksComponent))

		expect(container.querySelector('iframe')).toBeNull()
		expect(container.innerHTML).not.toMatch(THIRD_PARTY_HOSTS)
		expect(window.umami.track).not.toHaveBeenCalled()
	})

	it('shows a real button named after what it plays, in the setup steps section', () => {
		const { container } = render(createElement(HowItWorksComponent))

		const button = playButton()
		expect(button.tagName).toBe('BUTTON')
		expect(button.getAttribute('type')).toBe('button')
		expect(container.querySelector('#how-it-works').contains(button)).toBe(true)
		// the play icon is the visible label: the name comes from aria-label only
		expect(button.textContent).toBe('')
		expect(button.querySelector('svg').getAttribute('aria-hidden')).toBe('true')
	})

	it('shows the thumbnail through next/image, from the app itself', () => {
		render(createElement(PluginVideoComponent, { location: 'how-it-works' }))

		const image = within(playButton()).getByRole('presentation')
		expect(image.tagName).toBe('IMG')
		// the button already says what the picture is
		expect(image.getAttribute('alt')).toBe('')
		expect(image.getAttribute('src')).toMatch(/^\/_next\/image\?url=/)
		expect(new URLSearchParams(image.getAttribute('src').split('?')[1]).get('url')).toBe(POSTER)
		expect(image.getAttribute('srcset')).not.toMatch(/https?:/)
		// below the fold: not downloaded by a visitor who never scrolls to it
		expect(image.getAttribute('loading')).toBe('lazy')
	})

	it('gives the thumbnail its real size, so the page does not move when it loads', async () => {
		render(createElement(PluginVideoComponent, { location: 'how-it-works' }))

		const image = within(playButton()).getByRole('presentation')
		const { height, width } = await sharp(path.join(ROOT, 'public', POSTER)).metadata()
		expect(image.getAttribute('width')).toBe(String(width))
		expect(image.getAttribute('height')).toBe(String(height))
	})

	it('keeps the 16:9 box with rounded corners of the player', () => {
		render(createElement(PluginVideoComponent, { location: 'how-it-works' }))

		const button = playButton()
		expect(button.parentElement.className).toBe('aspect-video w-full')
		expect(button.className).toContain('h-full w-full')
		expect(button.className).toContain('rounded-xl')
		expect(button.className).toContain('overflow-hidden')
	})

	it('ships the thumbnail as a compressed 16:9 image', async () => {
		const file = path.join(ROOT, 'public', POSTER)

		const { format, height, width } = await sharp(file).metadata()
		expect(format).toBe('webp')
		expect(width).toBeGreaterThanOrEqual(1200)
		expect(width * 9).toBe(height * 16)
		expect(statSync(file).size).toBeLessThan(100 * 1024)
	})

	// YouTube's maxresdefault.jpg has 4 black pixels on each side: on the white
	// thumbnail they showed as two dark lines along the rounded box
	it('ships the thumbnail without the black side bars of the YouTube file', async () => {
		const file = path.join(ROOT, 'public', POSTER)
		const { height, width } = await sharp(file).metadata()

		// every pixel of the two columns on each side, the picture being white there
		const edges = await Promise.all(
			[0, width - 2].map(left => sharp(file).extract({ height, left, top: 0, width: 2 }).raw().toBuffer())
		)
		expect(edges.map(pixels => pixels.length)).toEqual([height * 2 * 3, height * 2 * 3])
		expect(Math.min(...edges.flatMap(pixels => [...pixels]))).toBeGreaterThan(200)
	})
})

describe('plugin demo video once played', () => {
	it('replaces the thumbnail by the cookieless player, which starts by itself', () => {
		render(createElement(HowItWorksComponent))

		fireEvent.click(playButton())

		const iframe = player()
		expect(iframe.tagName).toBe('IFRAME')
		expect(iframe.getAttribute('src')).toBe(PLAYER_URL)
		expect(iframe.getAttribute('allow')).toBe(
			'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
		)
		expect(iframe.hasAttribute('allowfullscreen')).toBe(true)
		expect(screen.queryByRole('button', { name: PLAY_BUTTON })).toBeNull()
		expect(document.querySelectorAll('iframe')).toHaveLength(1)
	})

	it('gives the player the box and the corners the thumbnail had', () => {
		render(createElement(HowItWorksComponent))

		fireEvent.click(playButton())

		const iframe = player()
		expect(iframe.parentElement.className).toBe('aspect-video w-full')
		expect(iframe.className).toBe('rounded-xl')
		expect(iframe.getAttribute('width')).toBe('100%')
		expect(iframe.getAttribute('height')).toBe('100%')
	})

	// the clicked button is gone: without this the keyboard falls back to <body>
	it('moves the keyboard focus to the player', () => {
		render(createElement(HowItWorksComponent))
		playButton().focus()

		fireEvent.click(playButton())

		expect(document.activeElement).toBe(player())
	})

	it('counts the play with the section it happened in', () => {
		render(createElement(HowItWorksComponent))

		fireEvent.click(playButton())

		expect(window.umami.track).toHaveBeenCalledTimes(1)
		expect(window.umami.track).toHaveBeenCalledWith('wp-video-play', { location: 'how-it-works' })
	})

	it('names the section given by the component that shows the video', () => {
		render(createElement(PluginVideoComponent, { location: 'hero' }))

		fireEvent.click(playButton())

		expect(window.umami.track).toHaveBeenCalledWith('wp-video-play', { location: 'hero' })
	})

	it('counts a click on the play icon like a click on the thumbnail', () => {
		render(createElement(HowItWorksComponent))

		fireEvent.click(playButton().querySelector('svg'))

		expect(player()).not.toBeNull()
		expect(window.umami.track).toHaveBeenCalledTimes(1)
	})

	// the button carries no data-fv-event: the document listener must not send
	// a second event for the same click
	it('counts one play per click next to the click listener of the layout', () => {
		useAuth.mockReturnValue({ isLoaded: true, isSignedIn: false })
		render(createElement('div', null, createElement(AnalyticsEventsComponent), createElement(HowItWorksComponent)))

		fireEvent.click(playButton())

		expect(window.umami.track).toHaveBeenCalledTimes(1)
		expect(window.umami.track).toHaveBeenCalledWith('wp-video-play', { location: 'how-it-works', signed_in: false })
	})

	it('sends nothing that could identify the visitor or the page they came from', () => {
		useAuth.mockReturnValue({ isLoaded: true, isSignedIn: true })
		render(createElement('div', null, createElement(AnalyticsEventsComponent), createElement(HowItWorksComponent)))

		fireEvent.click(playButton())

		const [, data] = window.umami.track.mock.calls[0]
		expect(Object.keys(data).sort()).toEqual(['location', 'signed_in'])
	})

	it('plays the video when a blocker removed the tracker', () => {
		delete window.umami
		render(createElement(HowItWorksComponent))

		fireEvent.click(playButton())

		expect(player().getAttribute('src')).toBe(PLAYER_URL)
	})

	it('plays the video when the tracker throws', () => {
		window.umami.track.mockImplementation(() => {
			throw new Error('tracker failure')
		})
		render(createElement(HowItWorksComponent))

		fireEvent.click(playButton())

		expect(player().getAttribute('src')).toBe(PLAYER_URL)
	})
})

describe('YouTube in the sources', () => {
	// youtube.com/embed sets cookies as soon as it loads, i.ytimg.com is a request to Google
	it('is only reached through the cookieless player of the facade', () => {
		const offenders = sources
			.filter(({ content }) => /youtube\.com|ytimg\.com|youtu\.be/.test(content))
			.map(({ file }) => file)
		const cookieless = sources.filter(({ content }) => content.includes('youtube-nocookie.com')).map(({ file }) => file)

		expect(offenders).toEqual([])
		expect(cookieless).toEqual([FACADE_FILE])
	})

	it('names the play event like the other events of the plugin page', () => {
		const facade = sources.find(({ file }) => file === FACADE_FILE).content

		expect(facade).toContain("track('wp-video-play', { location })")
		// our own attribute would send the event a second time, Umami's breaks links
		expect(facade).not.toMatch(/data-(fv|umami)-event/)
	})
})

describe('privacy policy', () => {
	function thirdPartyContent() {
		render(createElement(PrivacyPolicyPage))
		return screen.getByRole('heading', { name: 'Third-Party Content' }).parentElement.textContent
	}

	it('says the YouTube player and its cookies only load when the video is played', () => {
		const text = thirdPartyContent()

		expect(text).toContain(
			'The WordPress plugin page offers a video hosted by YouTube: the YouTube player and its cookies are loaded only when you choose to play the video.'
		)
		expect(text).not.toContain('embeds a YouTube video')
	})

	it('still covers the sign-in providers and their own policies', () => {
		const text = thirdPartyContent()

		expect(text).toContain('You can also choose to sign in with Google or GitHub.')
		expect(text).toContain(
			'These services may set their own cookies and process your data under their own privacy policies, which this Privacy Policy does not cover.'
		)
	})
})
