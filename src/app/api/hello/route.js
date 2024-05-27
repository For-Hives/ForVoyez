import { cookies } from 'next/headers'

export async function GET() {
	const cookieStore = cookies()
	const token = cookieStore.get('token')

	return new Response('Hello, Next.js!', {
		headers: { 'Set-Cookie': `token=${token}` },
		status: 200,
	})
}
