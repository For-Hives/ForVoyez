// Vitest executes source functions outside a Next.js request/compiler. Tests
// assert cache policy and invalidation explicitly through these spies.
import { vi } from 'vitest'

export const cacheLife = vi.fn()
export const cacheTag = vi.fn()
export const revalidateTag = vi.fn()
