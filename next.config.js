/** @type {import('next').NextConfig} */
const nextConfig = {
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
	experimental: {
		instrumentationHook: true,
	},
	reactStrictMode: true,
}

module.exports = nextConfig
