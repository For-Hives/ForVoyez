/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	safelist: [
		{
			// fixme replace kanit, playpen_sans etc with your chosen font
			pattern: /font-(kanit|playpen_sans)/,
		},
	],
	theme: {
		extend: {
			fontFamily: {
				// fixme replace kanit, playpen_sans etc with your chosen font
				kanit: 'var(--font-kanit)',
				playpen_sans: 'var(--font-playpen_sans)',
			},
			colors: {
				forvoyez_orange: {
					50: '#fff3f1',
					100: '#ffe5df',
					200: '#ffcfc5',
					300: '#ffae9d',
					400: '#ff7f64',
					500: '#ff6545',
					600: '#ed3a15',
					700: '#c82d0d',
					800: '#a5290f',
					900: '#882814',
					950: '#4b1004',
				},
			},
		},
	},
	darkMode: 'class',
	plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
}
