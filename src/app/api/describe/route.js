import { cookies } from 'next/headers'

export async function GET(request) {
	const cookieStore = cookies()
	const token = cookieStore.get('token')

	return new Response('Hello, Next.js!', {
		status: 200,
		headers: { 'Set-Cookie': `token=${token}` },
	})
}

export async function POST(request) {
	// the fuction get input : a multipart form data with:
	// - a file field named "image"
	// - a json field named "schema"

	// get the file from the form data
	const formData = await request.formData()
	const file = formData.get('image')

	// get the schema from the form data
	const schema = JSON.parse(formData.get('schema'))

	// to process the file, we call a service function that will return a promise
	const result = await processFile(file, schema)

	// the result is a JSON object that we can return as a response that contains the alt text, caption and title
	return new Response(JSON.stringify(result), {
		headers: {
			'Content-Type': 'application/json',
		},
	})
}
