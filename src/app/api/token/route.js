import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const { userId } = auth()

		if (!userId) {
			return new Response('Unauthorized', { status: 401 })
		}

		const data = { message: 'Hello World' }

		return NextResponse.json({ data })
	} catch (error) {
		return new Response('Internal Server Error', { status: 500 })
	}
}
