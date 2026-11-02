// Which images wait for their turn to be decoded, with the real sharp.
// @vitest-environment node

import sharp from 'sharp'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { withHeavyDecodeSlot } from '@/services/describeLimits.service'
import { blobToBase64 } from '@/services/imageDescription.service'

vi.mock('@/services/describeLimits.service', async importOriginal => {
	const actual = await importOriginal()
	return { ...actual, withHeavyDecodeSlot: vi.fn(actual.withHeavyDecodeSlot) }
})

function imageOf(width, height, encode) {
	return encode(sharp({ create: { background: '#c0392b', channels: 3, height, width } })).toBuffer()
}

const progressiveJpeg = image => image.jpeg({ progressive: true })
const interlacedPng = image => image.png({ progressive: true })

describe('heavy decodes', () => {
	beforeEach(() => {
		vi.mocked(withHeavyDecodeSlot).mockClear()
	})

	it.each([
		['a progressive JPEG', progressiveJpeg],
		['an interlaced PNG', interlacedPng],
	])(
		'makes %s of 12 MP wait for its turn',
		async (_, encode) => {
			await blobToBase64(new Blob([await imageOf(4000, 3000, encode)]))

			expect(withHeavyDecodeSlot).toHaveBeenCalledTimes(1)
		},
		60_000
	)

	it('does not make a usual web image wait', async () => {
		await blobToBase64(new Blob([await imageOf(2000, 1500, progressiveJpeg)]))

		expect(withHeavyDecodeSlot).not.toHaveBeenCalled()
	}, 60_000)

	it('does not make a baseline JPEG of the same size wait, it is read line by line', async () => {
		await blobToBase64(new Blob([await imageOf(4000, 3000, image => image.jpeg())]))

		expect(withHeavyDecodeSlot).not.toHaveBeenCalled()
	}, 60_000)

	it('still returns the image of those that waited', async () => {
		const images = await Promise.all(
			Array.from({ length: 3 }, async () => blobToBase64(new Blob([await imageOf(4000, 3000, progressiveJpeg)])))
		)

		const results = await Promise.all(images.map(base64 => sharp(Buffer.from(base64, 'base64')).metadata()))
		for (const { format, width } of results) {
			expect(format).toBe('webp')
			expect(width).toBe(1000)
		}
	}, 60_000)
})
