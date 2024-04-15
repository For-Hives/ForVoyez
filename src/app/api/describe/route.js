import {
	blobToBase64,
	getImageDescription,
} from '@/services/imageDescription.service'

export async function POST(request) {
	// Process multipart/form-data containing an image and a JSON schema.
	try {
		const formData = await request.formData()

		const file = formData.get('image')
		if (!file) {
			return new Response('No file uploaded', {
				status: 400,
				statusText: 'Bad Request',
			})
		}
		// todo : check if file is an image

		const schemaJSON = formData.get('schema')
		if (!schemaJSON) {
			return new Response('No schema provided', {
				status: 400,
				statusText: 'Bad Request',
			})
		}
		const schema = JSON.parse(schemaJSON)
		// todo : validate schema

		const base64Image = await blobToBase64(file)
		const descriptionResult = await getImageDescription(base64Image, schema)

		return new Response(JSON.stringify(descriptionResult), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		})
	} catch (error) {
		console.error('Error processing the request:', error)
		return new Response('Internal Server Error', { status: 500 })
	}
}
