const SITE_URL = 'https://forvoyez.com'

// The public, indexable pages. The account pages (noindex) and the sign-in and
// sign-up forms are left out. No lastModified: nothing here knows the real date.
const PUBLIC_PAGES = [
	{ changeFrequency: 'monthly', priority: 1, path: '/' },
	{ changeFrequency: 'monthly', path: '/wordpress-plugin', priority: 0.9 },
	{ changeFrequency: 'yearly', path: '/contact', priority: 0.5 },
	{ path: '/app/legals/terms', changeFrequency: 'yearly', priority: 0.2 },
	{ path: '/app/legals/privacy-policy', changeFrequency: 'yearly', priority: 0.2 },
	{ path: '/app/legals/legal-notice', changeFrequency: 'yearly', priority: 0.2 },
]

export default function sitemap() {
	return PUBLIC_PAGES.map(({ path, ...entry }) => ({
		...entry,
		url: path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`,
	}))
}
