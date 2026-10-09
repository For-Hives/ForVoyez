/** Runs each operation after the previous one succeeds; stops on the first rejection. */
export function forEachInSequence(items, action) {
	return Array.from(items).reduce((previous, item) => previous.then(() => action(item)), Promise.resolve())
}
