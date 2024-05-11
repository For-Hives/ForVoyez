import OpenAI from 'openai'
import sharp from 'sharp'

import { defaultJsonTemplateSchema } from '@/constants/playground'

function initOpenAI() {
	// ! Be careful, if you return directly the OpenAI instance, it will not work.
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	})
	return openai
}

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

		const bytes = new Uint8Array(optimizedImage)
		return Buffer.from(bytes).toString('base64')
	} catch (error) {
		throw new Error(`Image processing failed: ${error.message}`)
	}
}

/**
 * Get image description from OpenAI based on Base64 encoded image.
 * @param base64Image
 * @param data - Additional context for the image, { context: '...' , shema: { title: '...', alt: '...', caption: '...' }
 * @returns {Promise<any>}
 */
export async function getImageDescription(base64Image, data) {
	try {
		const openai = initOpenAI()

		// First request to GPT-Vision (non-streaming)
		const vision = await openai.chat.completions.create({
			model: 'gpt-4-vision-preview',
			messages: [
				{
					role: 'user',
					content: [
						`Describe this image. Make it simple. Only provide the context and an idea (think about alt text for SEO purposes). ${data.context ? `The additional context for the image is: ${data.context}.` : ''}`,
						{
							type: 'image_url',
							image_url: `data:image/png;base64,${base64Image}`,
						},
					],
				},
			],
		})

		const result = vision.choices[0].message.content

		// Generate alt text, caption, and title for the image
		const seoResponse = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo-0125',
			messages: [
				{
					role: 'user',
					content: `As an SEO expert, your task is to generate optimized metadata for an image based on the provided description and context. The goal is to create a title, alternative text, and caption that are not only informative and engaging but also search engine friendly.

Image Description: ${result}

Using the image description and the additional context provided below, please generate the following metadata elements, !!! Please format your response as a JSON object using this template !!!:
${JSON.stringify(data.schema || defaultJsonTemplateSchema, null, 2)}

Additional Context: ${data.context || 'No additional context provided.'}

Remember, the ultimate goal is to create metadata that enhances the image's visibility and accessibility while providing value to users. 
Focus on crafting descriptions that are rich in relevant keywords, yet natural and easy to understand.`,
				},
			],
			max_tokens: 750,
			n: 1,
			stop: null,
		})

		return JSON.parse(seoResponse.choices[0].message.content.trim() || '{}')
	} catch (error) {
		console.error('Failed to get image description:', error)
		throw new Error('OpenAI service failure')
	}
}
