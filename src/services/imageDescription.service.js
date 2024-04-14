export async function getImageDescription(imageUrl) {
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
		dangerouslyAllowBrowser: true,
	})

	try {
		let imageData

		// Check if the image URL is readable by ChatGPT
		if (
			imageUrl.startsWith('https://') &&
			!imageUrl.startsWith('https://localhost')
		) {
			// If the URL is readable, use it directly
			imageData = {
				type: 'image_url',
				image_url: imageUrl,
			}
		} else {
			// If the URL is not readable, download the image and send it in the request body
			// Prepend 'http://localhost:1337' to the image URL if it starts with '/'
			const fullImageUrl = imageUrl.startsWith('/')
				? `http://localhost:1337${imageUrl}`
				: imageUrl

			const response = await fetch(fullImageUrl)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const blob = await response.blob()

			// Encode the image blob as base64
			const base64Image = await this.blobToBase64(blob)

			imageData = {
				type: 'image_url',
				image_url: `data:image/png;base64,${base64Image}`,
			}
		}

		// Get the image description using the OpenAI API
		const response = await openai.chat.completions.create({
			model: 'gpt-4-vision-preview',
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'text',
							text: "What's in this image? Make it simple, I just want the context and an idea (think about alt text).",
						},
						imageData,
					],
				},
			],
		})

		// Generate alt text, caption, and title for the image
		const completion = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo-0125',
			messages: [
				{
					role: 'user',
					content: `You are an SEO expert and you are writing alt text, caption, and title for this image. The description of the image is: ${response.choices[0].message.content}. Give me a title (name) for this image, an SEO-friendly alternative text, and a caption for this image. Generate this information and respond with a JSON object using the following fields: name, alternativeText, caption. Use this JSON template: {"name": "string", "alternativeText": "string", "caption": "string"}.`,
				},
			],
			max_tokens: 750,
			n: 1,
			stop: null,
		})

		// Parse the generated JSON data and return it
		const generatedData = JSON.parse(
			completion.choices[0].message.content.trim() || '{}'
		)
		return generatedData
	} catch (error) {
		throw new Error('Failed to process image')
	}
}

export async function blobToBase64(blob) {
	const buffer = await blob.arrayBuffer()
	const bytes = new Uint8Array(buffer)
	const base64 = Buffer.from(bytes).toString('base64')
	return base64
}
