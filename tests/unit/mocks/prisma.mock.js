import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'
import { beforeEach } from 'vitest'

beforeEach(() => {
	mockReset(prisma)
})

/** @type {import("vitest-mock-extended").DeepMockProxyWithFuncPropSupport<PrismaClient>} */
const prisma = mockDeep()
export { prisma }
