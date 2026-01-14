import { Server, defineRoute, defineRoutes, json } from 'vafast'
import { bearer, getBearer } from '../src'
import { describe, expect, it } from 'vitest'

// Helper function to create test request
const createRequest = (url: string, options: RequestInit = {}) => {
	return new Request(url, {
		method: 'GET',
		...options
	})
}

// Test app with bearer middleware
const app = new Server(
	defineRoutes([
		defineRoute({
			method: 'GET',
			path: '/sign',
			handler: ({ bearer }) => {
				if (!bearer) {
					return json({ error: 'Unauthorized' })
				}
				return json({ token: bearer })
			},
			middleware: [bearer()]
		})
	])
)

// Non-RFC compliant app with custom extractors
const nonRFC = new Server(
	defineRoutes([
		defineRoute({
			method: 'GET',
			path: '/sign',
			handler: ({ bearer }) => {
				if (!bearer) {
					return json({ error: 'Unauthorized' })
				}
				return json({ token: bearer })
			},
			middleware: [bearer({
				extract: {
					body: 'a',
					header: 'a',
					query: 'a'
				}
			})]
		})
	])
)

describe('Bearer', () => {
	it('parse bearer from header', async () => {
		const res = await app.fetch(
			createRequest('http://localhost/sign', {
				headers: {
					Authorization: 'Bearer saltyAom'
				}
			})
		)

		const data = await res.json()
		expect(data.token).toBe('saltyAom')
	})

	it("don't parse empty Bearer header", async () => {
		const res = await app.fetch(
			createRequest('http://localhost/sign', {
				headers: {
					Authorization: 'Bearer '
				}
			})
		)

		const data = await res.json()
		expect(data.error).toBe('Unauthorized')
	})

	it('parse bearer from query', async () => {
		const res = await app.fetch(
			createRequest('http://localhost/sign?access_token=saltyAom')
		)

		const data = await res.json()
		expect(data.token).toBe('saltyAom')
	})

	it('parse bearer from custom header', async () => {
		const res = await nonRFC.fetch(
			createRequest('http://localhost/sign', {
				headers: {
					Authorization: 'a saltyAom'
				}
			})
		)

		const data = await res.json()
		expect(data.token).toBe('saltyAom')
	})

	it('parse bearer from custom query', async () => {
		const res = await nonRFC.fetch(
			createRequest('http://localhost/sign?a=saltyAom')
		)

		const data = await res.json()
		expect(data.token).toBe('saltyAom')
	})
})
