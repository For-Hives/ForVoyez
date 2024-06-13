const winston = require('winston')
const path = require('path')

const logDir = path.join(process.cwd(), 'logs')

const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.printf(({ timestamp, message, level }) => {
			return `[SERVER] [${timestamp}] [${level.toUpperCase()}] ${message}\n`
		})
	),
	transports: [
		new winston.transports.File({
			filename: path.join(logDir, 'combined-logs.txt'),
		}),
	],
	level: 'info',
})

module.exports = logger
