'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import TokenCreate from '@/components/tokens/TokenCreate'
import { auth } from '@clerk/nextjs'
import { createUser } from '@/app/app/welcome/createUser'

export default function WelcomePage() {
	useEffect(() => {
		createUser().then(r => console.log(r))
	}, [])

	return (
		<>
			<div className="p-8">
				<h1 className="mb-4 text-xl font-bold">embark here</h1>
			</div>
		</>
	)
}
