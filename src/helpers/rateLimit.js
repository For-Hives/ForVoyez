/**
 * Fixed-window counter, in the memory of this process (the app runs as one
 * container): a restart resets it, which is fine for slowing down abuse.
 * @param {{ limit: number, windowMs: number, maxKeys?: number }} options
 * @returns {(key: string) => boolean} counts one hit; false when it is over the limit
 */
export function createRateLimiter({ maxKeys = 10_000, windowMs, limit }) {
	const windows = new Map()

	function forgetExpired(now) {
		for (const [key, window] of windows) {
			if (window.endsAt <= now) windows.delete(key)
		}
	}

	return key => {
		const now = Date.now()
		let window = windows.get(key)

		if (!window || window.endsAt <= now) {
			if (windows.size >= maxKeys) forgetExpired(now)
			// still full of live windows: this key is not remembered, the global
			// limit of the caller stays in charge
			window = { endsAt: now + windowMs, hits: 0 }
			if (windows.size < maxKeys) windows.set(key, window)
		}

		window.hits += 1
		return window.hits <= limit
	}
}
