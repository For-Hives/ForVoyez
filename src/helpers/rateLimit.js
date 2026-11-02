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

	const hit = key => {
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

	// whether the next hit of this key would be refused, without counting one
	hit.isOver = key => {
		const window = windows.get(key)
		return Boolean(window) && window.endsAt > Date.now() && window.hits >= limit
	}

	return hit
}

/**
 * How many requests of one key are running right now, in this process.
 * @param {number} limit
 * @returns {(key: string) => (() => void) | null} a release function, null when the key is at its limit
 */
export function createInFlightLimiter(limit) {
	const running = new Map()

	return key => {
		const count = running.get(key) ?? 0
		if (count >= limit) return null
		running.set(key, count + 1)

		let released = false
		return () => {
			if (released) return
			released = true
			const left = running.get(key) - 1
			if (left > 0) running.set(key, left)
			else running.delete(key)
		}
	}
}

/**
 * Runs at most `max` tasks at a time, the others wait for their turn in order.
 * @param {number} max
 * @returns {<T>(task: () => Promise<T>) => Promise<T>}
 */
export function createConcurrencyGate(max) {
	const waiting = []
	let running = 0

	return async task => {
		if (running >= max) {
			// the slot of the task that ends is handed over, `running` does not move
			await new Promise(resolve => waiting.push(resolve))
		} else {
			running += 1
		}
		try {
			return await task()
		} finally {
			const next = waiting.shift()
			if (next) next()
			else running -= 1
		}
	}
}
