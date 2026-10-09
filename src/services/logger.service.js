import { Console } from 'node:console'

// Keep operational logs on stdout and errors on stderr, without browser console calls.
export const logger = new Console({ stdout: process.stdout, stderr: process.stderr })
