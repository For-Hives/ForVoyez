/** Returns true only after the browser actually accepts the copy operation. */
export default async function copyToClipboard(content) {
	if (typeof content !== 'string') return false
	if (navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(content)
			return true
		} catch (error) {
			console.error('Failed to copy:', error)
			return false
		}
	}

	const textarea = document.createElement('textarea')
	textarea.value = content
	textarea.style.position = 'fixed'
	textarea.style.opacity = '0'
	document.body.appendChild(textarea)
	textarea.select()
	try {
		return document.execCommand?.('copy') === true
	} catch (error) {
		console.error('Failed to copy with execCommand:', error)
		return false
	} finally {
		textarea.remove()
	}
}
