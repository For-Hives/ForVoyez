'use client'

import { getCheckoutURL, listProducts } from '@/services/lemonsqueezy.service'
import { useEffect, useState } from 'react'
import Image from 'next/image'
// import {redirect} from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PlansPage() {
	const router = useRouter()

	const [products, setProducts] = useState([])

	useEffect(() => {
		listProducts().then(r => setProducts(r))
	}, [])

	console.table(products)

	async function subscribe(variantId) {
		try {
			const url = await getCheckoutURL(variantId)
			await router.push(url)
		} catch (e) {
			console.log(e)
		}
	}

	return (
		<>
			<h1>Plans </h1>

			{products &&
				products.map((product, index) => {
					return (
						<div key={index} className="mb-2 mr-2 flex flex-col border p-4">
							<p>Name: {product.attributes.name}</p>
							<p>Descriptions: {product.attributes.description}</p>
							<p>Created at: {product.attributes.created_at.toString()}</p>
							<Image
								alt={product.attributes.description}
								src={product.attributes.large_thumb_url}
								width={250}
								height={250}
							/>
							<p>Price : {product.attributes.price_formatted}</p>
							<p>test mode ? : {product.attributes.test_mode}</p>

							{/* todo : verifier si il a pas deja souscris */}

							<button
								className="mt-2 rounded bg-red-500 px-4 py-2 text-white"
								onClick={async () => {
									subscribe(product.relationships.variants.data[0].id)
								}}
							>
								buy
							</button>
						</div>
					)
				})}

			{/*{*/}
			{/*    "store_id": 84282,*/}
			{/*    "name": "ForVoyez API to extract meta-description from images",*/}
			{/*    "slug": "forvoyez-api-to-extract-meta-description-from-images",*/}
			{/*    "description": "<p>ForVoyez API to extract meta-description from images</p>",*/}
			{/*    "status": "published",*/}
			{/*    "status_formatted": "Published",*/}
			{/*    "thumb_url": "https://lemonsqueezy.imgix.net/media/84282/7b96a385-fb1f-4a8a-8b88-97c3ae2eed14.png?fit=clip&h=100&ixlib=php-3.3.1&w=100&s=c110b47fedab3a6864eb74ef0c4f17de",*/}
			{/*    "large_thumb_url": "https://lemonsqueezy.imgix.net/media/84282/7b96a385-fb1f-4a8a-8b88-97c3ae2eed14.png?fit=clip&h=1000&ixlib=php-3.3.1&w=1000&s=48887f11ca206a5c389c0e95481316ff",*/}
			{/*    "price": 1000,*/}
			{/*    "price_formatted": "€10.00/month",*/}
			{/*    "from_price": null,*/}
			{/*    "to_price": null,*/}
			{/*    "pay_what_you_want": false,*/}
			{/*    "buy_now_url": "https://forvoyez.lemonsqueezy.com/checkout/buy/866eb225-d7f2-4638-af9b-ae9b8cbc9754",*/}
			{/*    "from_price_formatted": null,*/}
			{/*    "to_price_formatted": null,*/}
			{/*    "created_at": "2024-04-23T15:41:43.000000Z",*/}
			{/*    "updated_at": "2024-04-23T15:49:33.000000Z",*/}
			{/*    "test_mode": true*/}
			{/*}*/}
		</>
	)
}
