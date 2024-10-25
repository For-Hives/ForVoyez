export default function copyToClipboard(content) {
	if (navigator.clipboard) {
		navigator.clipboard.writeText(content).catch(err => {
			console.error('Failed to copy:', err)
		})
	} else {
		// Fallback to older execCommand approach
		const textarea = document.createElement('textarea')
		textarea.value = content
		document.body.appendChild(textarea)
		textarea.select()
		try {
			document.execCommand('copy')
		} catch (err) {
			console.error('Failed to copy with execCommand:', err)
		}
		document.body.removeChild(textarea)
	}
}
