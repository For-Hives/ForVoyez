import OpenAI from 'openai'
import sharp from 'sharp'

// Configure OpenAI client with environment-specific API key.
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

// Convert blob to Base64 string with image optimizations.
export async function blobToBase64(blob) {
	try {
		// Check image size
		const maxSizeInBytes = 5 * 1024 * 1024 * 2 // 10MB
		if (blob.size > maxSizeInBytes) {
			throw new Error('Image size exceeds the maximum limit of 10 MB')
		}

		// Check image type
		const supportedTypes = [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/webp',
			'image/gif',
		]
		if (!supportedTypes.includes(blob.type)) {
			throw new Error('Unsupported image type')
		}

		// Load image with sharp
		const image = sharp(await blob.arrayBuffer())

		// Check image dimensions
		const { width, height } = await image.metadata()
		const maxDimension = 2000 // Adjust this value as needed
		if (width > maxDimension || height > maxDimension) {
			image.resize(maxDimension, maxDimension, { fit: 'inside' })
		}

		// Optimize image
		const optimizedImage = await image.webp({ quality: 75 }).toBuffer()

		// log the new size
		console.log('Optimized image size:', optimizedImage.length)
		console.log('Original image size:', blob.size)

		const bytes = new Uint8Array(optimizedImage)
		return Buffer.from(bytes).toString('base64')
	} catch (error) {
		throw new Error(`Image processing failed: ${error.message}`)
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
		const result = vision.choices[0].message.content

		// Generate alt text, caption, and title for the image
		const seoResponse = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo-0125',
			messages: [
				{
					role: 'user',
					content: `You are an SEO expert and you are writing alt text, caption, and title for this image. The description of the image is: ${result}. Give me a title (name) for this image, an SEO-friendly alternative text, and a caption for this image. Generate this information and respond with a JSON object using the following fields: name, alternativeText, caption. Use this JSON template: {"name": "string", "alternativeText": "string", "caption": "string"}.`,
				},
			],
			max_tokens: 750,
			n: 1,
			stop: null,
		})

		console.log('SEO response:', seoResponse)

		return JSON.parse(seoResponse.choices[0].message.content.trim() || '{}')
	} catch (error) {
		console.error('Failed to get image description:', error)
		throw new Error('OpenAI service failure')
	}
}
