// blobToBase64 with the real sharp: what the model actually receives.
// @vitest-environment node
import { describe, expect, it } from 'vitest'
import sharp from 'sharp'

import { blobToBase64 } from '@/services/imageDescription.service'

async function decoded(base64) {
	return sharp(Buffer.from(base64, 'base64')).metadata()
}

function solidImage(width, height) {
	return sharp({
		create: { background: '#c0392b', channels: 3, height, width },
	})
}

describe('blobToBase64 (real sharp)', () => {
	it('sends small images as WebP without resizing them', async () => {
		const png = await solidImage(300, 200).png().toBuffer()

		const result = await decoded(
			await blobToBase64(new Blob([png], { type: 'image/png' }))
		)

		expect(result).toMatchObject({ format: 'webp', height: 200, width: 300 })
	})

	it('fits large images in 1000px, upright according to their EXIF orientation', async () => {
		// stored 3000x2000 landscape, displayed as a 2000x3000 portrait
		const jpeg = await solidImage(3000, 2000)
			.jpeg()
			.withMetadata({ orientation: 6 })
			.toBuffer()

		const result = await decoded(
			await blobToBase64(new Blob([jpeg], { type: 'image/jpeg' }))
		)

		expect(result).toMatchObject({ format: 'webp', height: 1000, width: 667 })
	})

	it('accepts GIF images', async () => {
		const gif = await solidImage(1200, 600).gif().toBuffer()

		const result = await decoded(
			await blobToBase64(new Blob([gif], { type: 'image/gif' }))
		)

		expect(result).toMatchObject({ format: 'webp', height: 500, width: 1000 })
	})
})
