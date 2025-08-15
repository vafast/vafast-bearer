import { Server, composeMiddleware, json } from 'tirne'
import { bearer } from '../src'

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
		handler: (req: any) => {
			const token = (req as any).bearer
			if (!token) {
				return json(
					{ error: 'Unauthorized' },
					400,
					{ 'WWW-Authenticate': 'Bearer realm="sign", error="invalid_request"' }
				)
			}
			return json({ token })
		}
	}
])

const handler = composeMiddleware([bearer()], (req: Request) => app.fetch(req))

// Non-RFC compliant app with custom extractors
const nonRFC = new Server([
	{
		method: 'GET',
		path: '/sign',
		handler: (req: any) => {
			const token = (req as any).bearer
			if (!token) {
				return json(
					{ error: 'Unauthorized' },
					400,
					{ 'WWW-Authenticate': 'a realm="sign", error="invalid_request"' }
				)
			}
			return json({ token })
		}
	}
])

const nonRFCHandler = composeMiddleware(
	[
		bearer({
			extract: {
				body: 'a',
				header: 'a',
				query: 'a'
			}
		})
	],
	(req: Request) => nonRFC.fetch(req)
)

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

		expect(res.status).toBe(400)
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
