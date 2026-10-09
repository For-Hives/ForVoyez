import { beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'

beforeEach(() => {
	mockReset(prisma)
})

/** @type {import("vitest-mock-extended").DeepMockProxyWithFuncPropSupport<import("@/generated/prisma/client").PrismaClient>} */
const prisma = mockDeep()

export { prisma }
