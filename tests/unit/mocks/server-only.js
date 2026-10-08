// `server-only` throws when imported outside a React Server environment.
// Next.js resolves it to a no-op on the server; do the same for unit tests.
export {}
