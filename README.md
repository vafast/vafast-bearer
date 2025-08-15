# @vafast/bearer

Middleware for [Tirne](https://github.com/tirnejs/tirne) for retrieving Bearer token.

This middleware is for retrieving a Bearer token specified in [RFC6750](https://www.rfc-editor.org/rfc/rfc6750#section-2).

This middleware **DOES NOT** handle authentication validation for your server, rather the middleware leaves the decision for developers to apply logic for handle validation check themself.

## Installation
```bash
bun add @vafast/bearer
```

## Example
```typescript
import { Server, composeMiddleware, json } from 'tirne'
import { bearer } from '@vafast/bearer'

// Define routes
const routes = [
  {
    method: 'GET',
    path: '/sign',
    handler: (req: any) => {
      const token = req.bearer
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
]

// Create server with bearer middleware
const server = new Server(routes)
const handler = composeMiddleware(
  [bearer()], // Add bearer middleware
  (req: Request) => server.fetch(req)
)

// Export for Bun/Workers
export default {
  fetch: handler
}
```

## API
This middleware decorates `bearer` into the request object.

### bearer
Extracted bearer token according to RFC6750, is either `string` or `undefined`.

If is undefined, means that there's no token provided.

## Config
Below is the configurable property for customizing the Bearer middleware.

### Extract
Custom extractor for retrieving tokens when the API doesn't compliant with RFC6750.

```typescript
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
```

## Features
- ✅ RFC6750 compliant
- ✅ Extract from Authorization header
- ✅ Extract from query parameters
- ✅ Extract from request body
- ✅ Customizable field names
- ✅ TypeScript support
- ✅ Bun and Node.js compatible
- ✅ Edge runtime ready