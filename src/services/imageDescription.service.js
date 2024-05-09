import OpenAI from 'openai'

// Configure OpenAI client with environment-specific API key.
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

// Convert blob to Base64 string.
export async function blobToBase64(blob) {
	try {
		// todo : check image size
		// todo : check image type
		// todo : check image dimensions
		// todo : check image quality
		// todo : check image format
		// todo : check image orientation

		const buffer = await blob.arrayBuffer()
		const bytes = new Uint8Array(buffer)
		return Buffer.from(bytes).toString('base64')
	} catch (error) {
		throw new Error('Conversion to Base64 failed')
	}
}

// Get image description from OpenAI based on Base64 encoded image.
export async function getImageDescription(base64Image, schema) {
	try {
		// First request to GPT-Vision (non-streaming)
		const vision = await openai.chat.completions.create({
			model: 'gpt-4-vision-preview',
			messages: [
				{
					role: 'user',
					content: [
						`Describe this image. Make it simple. Only provide the context and an idea (think about alt text for SEO purposes). ${schema.context ? `The additional context for the image is: ${schema.context}.` : ''}`,
						{
							type: 'image_url',
							image_url: `data:image/png;base64,${base64Image}`,
						},
					],
				},
			],
		})

		console.log('Vision response:', vision.choices[0].message.content)
		const imageDescription = vision.choices[0].message.content

		console.log('Image description:', imageDescription)

		// Second request to generate alt text, caption, and title (streaming)
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: 'gpt-3.5-turbo-0125',
				messages: [
					{
						role: 'user',
						content: `You are an SEO expert and you are writing alt text, caption, and title for this image. The description of the image is: ${imageDescription}. Give me a title (name) for this image, an SEO-friendly alternative text, and a caption for this image. Generate this information and respond with a JSON object using the following fields: name, alternativeText, caption. Use this JSON template: {"name": "string", "alternativeText": "string", "caption": "string"}.`,
					},
				],
				max_tokens: 750,
				n: 1,
				stop: null,
				stream: true,
			}),
		})

		console.log('SEO response:', response)

		// Process the stream
		const reader = response.body.getReader()
		const decoder = new TextDecoder('utf-8')
		let result = ''

		console.log('before while', reader)
		while (true) {
			const { done, value } = await reader.read()
			if (done) break

			const chunk = decoder.decode(value)
			console.log('Chunk:', chunk)

			const lines = chunk.split('\n').filter(line => line.trim() !== '')
			for (const line of lines) {
				const message = line.replace(/^data: /, '')
				if (message === '[DONE]') {
					return result
				}
				result += message
			}
		}
	} catch (error) {
		console.error('Failed to get image description:', error)
		throw new Error('OpenAI service failure')
	}
}
