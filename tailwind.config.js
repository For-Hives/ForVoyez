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
		},
	},
	darkMode: 'class',
	plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
}
