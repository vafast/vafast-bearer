import { Server, composeMiddleware, json } from 'tirne'
import { bearer } from '../src/index'

// Define route handlers
const routes = [
	{
		method: 'GET',
		path: '/',
		handler: () => json({ message: 'Bearer Token API' })
	},
	{
		method: 'GET',
		path: '/sign',
		handler: (req: any) => {
			// Access bearer token from request
			const token = (req as any).bearer
			if (!token) {
				return json(
					{ error: 'Unauthorized', message: 'Bearer token required' },
					401,
					{ 'WWW-Authenticate': 'Bearer realm="sign", error="invalid_request"' }
				)
			}
			return json({ token })
		}
	}
]

// Create server with bearer middleware
const server = new Server(routes)

// Compose middleware with bearer authentication
const handler = composeMiddleware(
	[bearer()], // Add bearer middleware
	(req: Request) => server.fetch(req)
)

// Export for Bun/Workers
export default {
	fetch: handler
}
