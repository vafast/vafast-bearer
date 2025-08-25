import { Server, createRouteHandler } from 'vafast'
import { bearer, createTypedHandler } from '../src'

import { describe, expect, it } from 'bun:test'

// Helper function to create test request
const createRequest = (url: string, options: RequestInit = {}) => {
	return new Request(url, {
		method: 'GET',
		...options
	})
}

// Test app with bearer middleware
const app = new Server([
	{
		method: 'GET',
		path: '/sign',
		handler: createTypedHandler({}, ({ bearer }) => {
			if (!bearer) {
				return {
					error: 'Unauthorized'
				}
			}
			return { token: bearer }
		})
	}
])

const handler = (req: Request) => {
	return bearer()(req, () => app.fetch(req))
}

// Non-RFC compliant app with custom extractors
const nonRFC = new Server([
	{
		method: 'GET',
		path: '/sign',
		handler: createTypedHandler({}, ({ bearer }) => {
			if (!bearer) {
				return {
					error: 'Unauthorized'
				}
			}
			return { token: bearer }
		})
	}
])

const nonRFCHandler = (req: Request) => {
	return bearer({
		extract: {
			body: 'a',
			header: 'a',
			query: 'a'
		}
	})(req, () => nonRFC.fetch(req))
}

describe('Bearer', () => {
	it('parse bearer from header', async () => {
		const res = await handler(
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
		const res = await handler(
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
		const res = await handler(
			createRequest('http://localhost/sign?access_token=saltyAom')
		)

		const data = await res.json()
		expect(data.token).toBe('saltyAom')
	})

	it('parse bearer from custom header', async () => {
		const res = await nonRFCHandler(
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
		const res = await nonRFCHandler(
			createRequest('http://localhost/sign?a=saltyAom')
		)

		const data = await res.json()
		expect(data.token).toBe('saltyAom')
	})
})
