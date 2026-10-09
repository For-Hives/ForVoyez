// blobToBase64 with the real sharp: what the model actually receives.
// @vitest-environment node

import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import { blobToBase64, UnsupportedImageError } from '@/services/imageDescription.service'

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

		const result = await decoded(await blobToBase64(new Blob([png], { type: 'image/png' })))

		expect(result).toMatchObject({ format: 'webp', height: 200, width: 300 })
	})

	it('fits large images in 1000px, upright according to their EXIF orientation', async () => {
		// stored 3000x2000 landscape, displayed as a 2000x3000 portrait
		const jpeg = await solidImage(3000, 2000).jpeg().withMetadata({ orientation: 6 }).toBuffer()

		const result = await decoded(await blobToBase64(new Blob([jpeg], { type: 'image/jpeg' })))

		expect(result).toMatchObject({ format: 'webp', height: 1000, width: 667 })
	})

	it('accepts GIF images', async () => {
		const gif = await solidImage(1200, 600).gif().toBuffer()

		const result = await decoded(await blobToBase64(new Blob([gif], { type: 'image/gif' })))

		expect(result).toMatchObject({ format: 'webp', height: 500, width: 1000 })
	})

	// the format is read from the bytes, never from the declared MIME type
	describe('image format', () => {
		const svg = Buffer.from(
			'<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"><rect width="40" height="30" fill="red"/></svg>'
		)

		it.each([
			['webp', 'application/octet-stream'],
			['png', ''],
			['jpeg', 'image/png'],
			['gif', 'text/plain'],
		])('accepts a %s image sent as "%s"', async (format, declaredType) => {
			const bytes = await solidImage(40, 30)[format]().toBuffer()

			const result = await decoded(await blobToBase64(new Blob([bytes], { type: declaredType })))

			expect(result).toMatchObject({ format: 'webp', height: 30, width: 40 })
		})

		it.each([
			['an SVG', 'image/png', async () => svg],
			['an SVG', 'image/svg+xml', async () => svg],
			['an AVIF', 'image/png', () => solidImage(40, 30).avif().toBuffer()],
			['an AVIF', 'image/avif', () => solidImage(40, 30).avif().toBuffer()],
			['a TIFF', 'image/png', () => solidImage(40, 30).tiff().toBuffer()],
			['a TIFF', 'image/jpeg', () => solidImage(40, 30).tiff().toBuffer()],
			['a text file', 'image/jpeg', async () => Buffer.from('hello world')],
			['an empty file', 'image/png', async () => Buffer.alloc(0)],
		])('refuses %s sent as "%s"', async (_name, declaredType, makeBytes) => {
			const blob = new Blob([await makeBytes()], { type: declaredType })

			await expect(blobToBase64(blob)).rejects.toThrow(UnsupportedImageError)
		})
	})
})
