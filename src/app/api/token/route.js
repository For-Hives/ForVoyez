import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const data = { message: 'Hello World' }

		return NextResponse.json({ data })
	} catch (error) {
		console.error('Error processing the request:', error)
		return new Response('Internal Server Error', { status: 500 })
	}
}
