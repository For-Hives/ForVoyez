export default function robots() {
	return {
		rules: {
			// the legal pages are public, under the otherwise private /app/. The slash
			// matters: '/app' alone would also block /apple-icon.png
			allow: ['/', '/app/legals'],
			disallow: ['/app/', '/api/', '/profile'],
			userAgent: '*',
		},
		sitemap: 'https://forvoyez.com/sitemap.xml',
	}
}
