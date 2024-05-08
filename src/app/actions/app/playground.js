'use server'

export async function describePlayground() {
	if (process.env.NODE_ENV === 'development') {
		return new Response(
			JSON.stringify({
				name: 'Cherry Blossom Kittens',
				alternativeText:
					'Two playful animated kittens surrounded by cherry blossoms',
				caption: 'Adorable kittens frolicking among beautiful cherry blossoms',
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}
		)
	} else {
		// fixme: implement this
		return new Response('Not implemented', {
			status: 401,
			statusText: 'Not implemented',
		})
	}
}
