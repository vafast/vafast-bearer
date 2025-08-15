import type { Middleware } from 'tirne'

export interface BearerOptions {
	/**
	 * If the API doesn't compliant with RFC6750
	 * The key for extracting the token is configurable
	 */
	extract: {
		/**
		 * Determined which fields to be identified as Bearer token
		 *
		 * @default access_token
		 */
		body?: string
		/**
		 * Determined which fields to be identified as Bearer token
		 *
		 * @default access_token
		 */
		query?: string
		/**
		 * Determined which type of Authentication should be Bearer token
		 *
		 * @default Bearer
		 */
		header?: string
	}
}

/**
 * Tirne middleware for extracting Bearer token from requests
 * Compliant with RFC6750 specification
 */
export const bearer = (
	{
		extract: {
			body = 'access_token',
			query: queryName = 'access_token',
			header = 'Bearer'
		} = {
			body: 'access_token',
			query: 'access_token',
			header: 'Bearer'
		}
	}: BearerOptions = {
		extract: {
			body: 'access_token',
			query: 'access_token',
			header: 'Bearer'
		}
	}
): Middleware => {
	return async (req, next) => {
		// Extract bearer token from Authorization header
		const authorization = req.headers.get('authorization')
		let bearerToken: string | undefined

		if (authorization?.startsWith(header)) {
			bearerToken = authorization.slice(header.length + 1)
		}

		// Extract from query parameters if not found in header
		if (!bearerToken) {
			const url = new URL(req.url)
			const queryToken = url.searchParams.get(queryName)
			if (queryToken) {
				bearerToken = queryToken
			}
		}

		// Extract from body if not found in header or query
		if (!bearerToken && req.method !== 'GET') {
			try {
				const bodyData = await req.clone().json() as Record<string, any>
				if (bodyData && typeof bodyData === 'object' && bodyData[body]) {
					bearerToken = bodyData[body]
				}
			} catch {
				// Ignore body parsing errors
			}
		}

		// Attach bearer token to request for downstream handlers
		;(req as any).bearer = bearerToken

		return next()
	}
}

export default bearer
