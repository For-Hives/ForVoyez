// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const { scripts } = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'))
const directories = []

afterEach(() => {
	for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

function setup() {
	const directory = mkdtempSync(join(tmpdir(), 'forvoyez-startup-'))
	directories.push(directory)
	writeFileSync(
		join(directory, 'prisma'),
		'#!/bin/sh\nprintf "prisma %s\\n" "$*" >> "$STARTUP_LOG"\nexit "$MIGRATION_EXIT"\n',
		{ mode: 0o755 }
	)
	writeFileSync(join(directory, 'next'), '#!/bin/sh\nprintf "next %s\\n" "$*" >> "$STARTUP_LOG"\n', { mode: 0o755 })
	return {
		directory,
		env: { ...process.env, PATH: directory, STARTUP_LOG: join(directory, 'calls'), MIGRATION_EXIT: '0' },
	}
}

describe('production startup contract', () => {
	it('applies migrations before starting the production server', () => {
		const { directory, env } = setup()
		execFileSync('/bin/sh', ['-c', scripts.start], { env })
		expect(readFileSync(join(directory, 'calls'), 'utf8')).toBe('prisma migrate deploy\nnext start\n')
	})
	it('does not start the server when migration fails', () => {
		const { directory, env } = setup()
		expect(() => execFileSync('/bin/sh', ['-c', scripts.start], { env: { ...env, MIGRATION_EXIT: '1' } })).toThrow()
		expect(readFileSync(join(directory, 'calls'), 'utf8')).toBe('prisma migrate deploy\n')
	})
})
