# @vafast/bearer

从请求中按 [RFC6750](https://www.rfc-editor.org/rfc/rfc6750) **提取** Bearer token，通过 `next({ bearer })` 注入上下文。

**不验签、不鉴权**；缺失时为 `undefined`，由业务决定如何处理。

## 安装

```bash
npm install @vafast/bearer
```

## 快速开始

```typescript
import { Server, defineRoute, defineRoutes, err, json, serve } from 'vafast'
import { bearer } from '@vafast/bearer'

const routes = defineRoutes([
  defineRoute({
    method: 'GET',
    path: '/profile',
    middleware: [bearer()],
    handler: ({ bearer: token }) => {
      if (!token) throw err.unauthorized('缺少 Bearer token')
      return json({ token })
    },
  }),
])

const server = new Server(routes)
serve({ fetch: server.fetch, port: 3000 })
```

提取顺序：`Authorization` 头 → query（默认 `access_token`）→ 非 GET 的 body 字段。

## 选项摘要

```typescript
bearer({
  extract: {
    header?: string  // 默认 'Bearer'
    query?: string   // 默认 'access_token'
    body?: string    // 默认 'access_token'
  },
})
```

另导出 `getBearer(req)`，可从中间件写入的 locals 读取 token。

## 文档

完整用法见站点文档：[Bearer 中间件](https://vafast.huyooo.com/middleware/bearer.html)（仓库内 `vafast-doc/docs/middleware/bearer.md`）。
