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
