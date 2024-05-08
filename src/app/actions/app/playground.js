'use server'

export async function describePlayground() {
	if (process.env.NODE_ENV === 'development') {
		return {
			name: 'Cherry Blossom Kittens',
			alternativeText:
				'Two playful animated kittens surrounded by cherry blossoms',
			caption: 'Adorable kittens frolicking among beautiful cherry blossoms',
		}
	} else {
		// fixme: implement this
		throw new Error('Not implemented')
	}
}
