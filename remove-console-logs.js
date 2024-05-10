const fs = require('fs')
const path = require('path')

function removeConsoleLogs(filePath) {
	const fileContent = fs.readFileSync(filePath, 'utf-8')
	const lines = fileContent.split('\n')
	// Remove lines that contain console.[smtg]
	// const filteredLines = lines.filter(line => !line.includes('console.log'))
	const filteredLines = lines.filter(line => !line.includes('console.'))

	if (lines.length !== filteredLines.length) {
		fs.writeFileSync(filePath, filteredLines.join('\n'), 'utf-8')
	}
}

function walkDir(dir) {
	const files = fs.readdirSync(dir)
	files.forEach(file => {
		const filePath = path.join(dir, file)
		const stat = fs.lstatSync(filePath)
		if (stat.isDirectory()) {
			walkDir(filePath)
		} else if (filePath.endsWith('.js')) {
			removeConsoleLogs(filePath)
		}
	})
}

walkDir('src')
