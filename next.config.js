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
	reactStrictMode: true,
}

module.exports = nextConfig
