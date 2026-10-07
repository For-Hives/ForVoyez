/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				headers: [
					{
						key: 'X-DNS-Prefetch-Control',
						value: 'on',
					},
					{
						value: 'max-age=31536000; includeSubDomains',
						key: 'Strict-Transport-Security',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'X-Frame-Options',
						value: 'SAMEORIGIN',
					},
					{
						value: 'strict-origin-when-cross-origin',
						key: 'Referrer-Policy',
					},
				],
				source: '/:path*',
			},
			{
				headers: [
					{
						value: process.env.NEXT_PUBLIC_API_URL || '*',
						key: 'Access-Control-Allow-Origin',
					},
					{
						value: 'GET, POST, PUT, DELETE, OPTIONS',
						key: 'Access-Control-Allow-Methods',
					},
					{
						value: 'Content-Type, Authorization',
						key: 'Access-Control-Allow-Headers',
					},
				],
				source: '/api/:path*',
			},
		]
	},

	experimental: {
		// The playground promises 10 MB images (Playground.component.js). A
		// 10 MB file plus the multipart framing and the `data` field is a bit
		// more than 10 MB, hence 11 MB for the server action body (default 1 MB)
		// and for the body the proxy buffers (default 10 MB, truncated beyond).
		serverActions: {
			bodySizeLimit: '11mb',
		},
		proxyClientMaxBodySize: '11mb',
	},

	images: {
		remotePatterns: [
			{
				hostname: '**.andy-cinquin.fr',
				protocol: 'https',
			},
			{
				hostname: 'lemonsqueezy.imgix.net',
				protocol: 'https',
			},
			{
				hostname: '**.forvoyez.com',
				protocol: 'https',
			},
		],
	},
	reactStrictMode: true,
}

module.exports = nextConfig
