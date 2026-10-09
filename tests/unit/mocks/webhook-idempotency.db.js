// In-memory stand-in for the tables the Lemon Squeezy webhook reads and
// writes, behind the subset of the Prisma client API it uses. An interactive
// transaction (`$transaction(callback)`) undoes its writes when the callback
// throws, and `pg_advisory_xact_lock` is an in-process lock held until the
// transaction ends. Writes are visible to other transactions before commit
// (no isolation): concurrent deliveries are kept apart by that lock only, as
// in the code under test.

class ForeignKeyError extends Error {
	code = 'P2003'
}

class RecordNotFoundError extends Error {
	code = 'P2025'
}

class UniqueConstraintError extends Error {
	code = 'P2002'
}

export function createWebhookDatabase() {
	const database = {
		reset() {
			database.tables = {
				webhookEvent: [],
				subscription: [],
				usage: [],
				user: [],
				plan: [],
			}
			database.transactions = [] // the options of each $transaction
			database.lockedKeys = [] // advisory lock keys, in locking order
			failures.length = 0
			locks.clear()
		},
		credits(clerkId) {
			return database.tables.user.find(user => user.clerkId === clerkId)?.credits
		},
		// The next call to `name` (e.g. 'usage.create') throws `error`
		failOnce(name, error) {
			failures.push({ error, name })
		},
		events() {
			return database.tables.webhookEvent
		},
		client: null,
	}

	const failures = []
	const locks = new Map() // key -> promise resolved when it is released
	let nextId = 1

	function failIfAsked(name) {
		const index = failures.findIndex(failure => failure.name === name)
		if (index !== -1) {
			const [{ error }] = failures.splice(index, 1)
			throw error
		}
	}

	async function acquire(key, held) {
		if (locks.has(key)) {
			await locks.get(key)
			return acquire(key, held)
		}
		let release
		locks.set(key, new Promise(resolve => (release = resolve)))
		database.lockedKeys.push(key)
		held.push(() => {
			locks.delete(key)
			release()
		})
	}

	// `transaction` is { undo, held } inside a transaction, null outside
	function createClient(transaction) {
		const remember = undo => transaction?.undo.push(undo)
		const table = name => database.tables[name]

		function insert(name, row) {
			table(name).push(row)
			remember(() => table(name).splice(table(name).indexOf(row), 1))
			return { ...row }
		}

		function change(row, data) {
			const previous = { ...row }
			for (const [field, value] of Object.entries(data)) {
				row[field] =
					value !== null && typeof value === 'object' && 'increment' in value ? row[field] + value.increment : value
			}
			remember(() => {
				for (const field of Object.keys(row)) {
					delete row[field]
				}
				Object.assign(row, previous)
			})
			return row
		}

		// every call yields, so concurrent deliveries interleave
		function model(name, methods) {
			return Object.fromEntries(
				Object.entries(methods).map(([method, implementation]) => [
					method,
					async (...args) => {
						await Promise.resolve()
						failIfAsked(`${name}.${method}`)
						return implementation(...args)
					},
				])
			)
		}

		const withPlan = row =>
			row && {
				...row,
				plan: table('plan').find(plan => plan.id === row.planId) ?? null,
			}

		const findSubscription = ({ where }) =>
			table('subscription').find(row => matchesWhere(row, { lemonSqueezyId: where.lemonSqueezyId }))

		return {
			webhookEvent: model('webhookEvent', {
				create: ({ data }) => {
					// WebhookEvent_userId_fkey: REFERENCES User(clerkId)
					if (!table('user').some(row => row.clerkId === data.userId)) {
						throw new ForeignKeyError('Foreign key constraint violated')
					}
					return insert('webhookEvent', {
						processingError: null,
						createdAt: new Date(),
						processed: false,
						id: nextId++,
						...data,
					})
				},
				update: ({ where, data }) => {
					const row = table('webhookEvent').find(row => row.id === where.id)
					if (!row) throw new RecordNotFoundError('No WebhookEvent found')
					return { ...change(row, data) }
				},
				findMany: ({ select, where }) =>
					table('webhookEvent')
						.filter(row => matchesWhere(row, where))
						.map(row => pick(row, select)),
				findUnique: ({ where }) => {
					const row = table('webhookEvent').find(row => row.id === where.id)
					return row ? { ...row } : null
				},
			}),
			user: model('user', {
				update: ({ select, where, data }) => {
					const row = table('user').find(row => row.clerkId === where.clerkId)
					if (!row) throw new RecordNotFoundError('No User found')
					return pick(change(row, data), select)
				},
				upsert: ({ create, update, where }) => {
					const row = table('user').find(row => row.clerkId === where.clerkId)
					return row ? { ...change(row, update) } : insertUser(create)
				},
				findUnique: ({ select, where }) => {
					const row = table('user').find(row => row.clerkId === where.clerkId)
					return row ? pick(row, select) : null
				},
				create: ({ data }) => insertUser(data),
			}),
			subscription: model('subscription', {
				create: ({ data }) => {
					if (findSubscription({ where: data })) {
						throw new UniqueConstraintError('Unique constraint failed')
					}
					return insert('subscription', { oldPlanId: null, ...data })
				},
				update: ({ where, data }) => {
					const row = findSubscription({ where })
					if (!row) throw new RecordNotFoundError('No Subscription found')
					return { ...change(row, data) }
				},
				findUnique: args => withPlan(findSubscription(args)) ?? null,
				findFirst: args => withPlan(findSubscription(args)) ?? null,
			}),
			$executeRaw: async (strings, ...values) => {
				await Promise.resolve()
				failIfAsked('$executeRaw')
				const sql = strings.join('?')
				if (!sql.includes('pg_advisory_xact_lock')) {
					throw new Error(`Unexpected SQL: ${sql}`)
				}
				if (!transaction) {
					throw new Error('pg_advisory_xact_lock outside a transaction')
				}
				await acquire(values[0], transaction.held)
				return 1
			},
			$transaction: async (callback, options) => {
				database.transactions.push(options)
				const inner = { undo: [], held: [] }
				try {
					return await callback(createClient(inner))
				} catch (error) {
					for (const undo of inner.undo.reverse()) {
						undo()
					}
					throw error
				} finally {
					for (const release of inner.held) {
						release()
					}
				}
			},
			plan: model('plan', {
				findUnique: ({ where }) =>
					table('plan').find(plan =>
						where.id === undefined ? plan.variantId === where.variantId : plan.id === where.id
					) ?? null,
			}),
			usage: model('usage', {
				create: ({ data }) => insert('usage', { id: nextId++, ...data }),
			}),
			token: model('token', { findFirst: () => null }),
		}

		function insertUser(data) {
			if (table('user').some(row => row.clerkId === data.clerkId)) {
				throw new UniqueConstraintError('Unique constraint failed')
			}
			return insert('user', { customerId: null, credits: 0, ...data })
		}
	}

	database.client = createClient(null)
	database.reset()
	return database
}

// Prisma `where` subset: equality, `in`, `not`, `startsWith` and `OR`
function matchesWhere(row, where = {}) {
	return Object.entries(where).every(([field, condition]) => {
		if (field === 'OR') return condition.some(alt => matchesWhere(row, alt))
		const value = row[field]
		if (condition !== null && typeof condition === 'object') {
			if ('in' in condition) return condition.in.includes(value)
			if ('not' in condition) return value !== condition.not
			if ('startsWith' in condition) return String(value ?? '').startsWith(condition.startsWith)
		}
		return value === condition
	})
}

function pick(row, select) {
	if (!select) return { ...row }
	return Object.fromEntries(
		Object.keys(select)
			.filter(field => select[field])
			.map(field => [field, row[field]])
	)
}

// shared by a test file and its `vi.mock('@/services/prisma.service')`
export const database = createWebhookDatabase()
