import { defineMiddleware } from 'vafast'
import { parseQuery, parseBody } from 'vafast'

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
) => {
	return defineMiddleware<{ bearer?: string }>(async (req, next) => {
		// Extract bearer token from Authorization header
		const authorization = req.headers.get('authorization')
		let bearerToken: string | undefined

		if (authorization?.startsWith(header)) {
			bearerToken = authorization.slice(header.length + 1)
		}

		// Extract from query parameters if not found in header (使用 vafast 内置解析器)
		if (!bearerToken) {
			const query = parseQuery(req)
			const queryToken = query[queryName]
			if (typeof queryToken === 'string') {
				bearerToken = queryToken
			}
		}

		// Extract from body if not found in header or query (使用 vafast 内置解析器)
		if (!bearerToken && req.method !== 'GET') {
			try {
				const bodyData = await parseBody(req.clone()) as Record<string, unknown>
				if (
					bodyData &&
					typeof bodyData === 'object' &&
					bodyData[body]
				) {
					bearerToken = bodyData[body] as string
				}
			} catch {
				// Ignore body parsing errors
			}
		}

		// 通过 next 传递 bearer token 到上下文
		return next({ bearer: bearerToken })
	})
}

// 获取 bearer token 的辅助函数
export const getBearer = (req: Request): string | undefined => {
	const locals = (req as unknown as { __locals?: { bearer?: string } }).__locals
	return locals?.bearer
}

export default bearer
