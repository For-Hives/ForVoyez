// Renovate merges minor, patch and lock file updates alone, and a merge deploys.
// Both delays are needed: Renovate does not check the age of the packages its
// lock file maintenance brings in, pnpm does the resolving there.
// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const renovate = JSON.parse(readFileSync(resolve(process.cwd(), 'renovate.json'), 'utf8'))
const workspace = readFileSync(resolve(process.cwd(), 'pnpm-workspace.yaml'), 'utf8')

const THREE_DAYS_IN_MINUTES = 3 * 24 * 60

describe('release age of automatic updates', () => {
	it('makes Renovate wait three days after a release', () => {
		expect(renovate.minimumReleaseAge).toBe('3 days')
	})

	it('has no package rule removing the Renovate delay', () => {
		for (const rule of renovate.packageRules) {
			expect(rule).not.toHaveProperty('minimumReleaseAge')
		}
	})

	it('makes pnpm refuse the same releases during lock file maintenance', () => {
		expect(renovate.lockFileMaintenance.automerge).toBe(true)
		expect(Number(workspace.match(/^minimumReleaseAge: (\d+)$/m)?.[1])).toBe(THREE_DAYS_IN_MINUTES)
	})

	it('lets no package escape the pnpm delay', () => {
		expect(workspace).not.toMatch(/minimumReleaseAgeExclude/)
	})
})
