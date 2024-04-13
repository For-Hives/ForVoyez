/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			// fixme replace that with your own url ( here is an example )
			{
				protocol: 'https',
				hostname: '**.andy-cinquin.fr',
			},
		],
	},
}

module.exports = nextConfig
