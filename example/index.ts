import { Server, createRouteHandler } from 'vafast'
import { bearer, createTypedHandler } from '../src/index'

// Define route handlers using vafast style
const routes = [
	{
		method: 'GET',
		path: '/',
		handler: createRouteHandler(() => {
			return {
				message: 'Bearer Token API'
			}
		})
	},
	{
		method: 'GET',
		path: '/sign',
		handler: createTypedHandler({}, ({ bearer }) => {
			// Access bearer token with full type safety
			if (!bearer) {
				return {
					error: 'Unauthorized',
					message: 'Bearer token required'
				}
			}
			return { token: bearer }
		})
	}
]

// Create server with bearer middleware
const server = new Server(routes)

// Export for Bun/Workers with bearer middleware
export default {
	fetch: (req: Request) => {
		// Apply bearer middleware
		return bearer()(req, () => server.fetch(req))
	}
}
