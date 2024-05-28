import MillionLint from '@million/lint'

/** @type {import("next").NextConfig} */
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

export default MillionLint.next({ rsc: true })(nextConfig)
