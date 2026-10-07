import { defineConfig } from 'prisma/config'

// Prisma 7 no longer loads `.env` on its own. Keep the Prisma 6 behaviour
// (read `./.env` when it exists) without depending on `dotenv`, which is not
// installed in production images. Variables already set in the environment
// (CI, Docker, Coolify) always win.
try {
	process.loadEnvFile()
} catch {
	// no .env file: rely on the real environment
}

export default defineConfig({
	migrations: {
		seed: 'node prisma/seed.js',
		path: 'prisma/migrations',
	},
	datasource: {
		// `prisma generate` (run by `pnpm build`) works without a database URL,
		// so read it directly instead of using env(), which throws when unset.
		url: process.env.DATABASE_URL,
	},
	schema: 'prisma/schema.prisma',
})
