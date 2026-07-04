# @agrajag/mcp-adapter

Expose agrajag `ResourceDefinition`s as [Model Context Protocol](https://modelcontextprotocol.io)
tools. Like the other adapters it plugs into agrajag's `Builder`: core's
capability gating, path scheme, and endpoint `operation` drive an
`McpServerBuilder` that emits one set of tools per resource, with input schemas
derived from the resource's zod attributes and relationship graph. No
per-resource code.

```ts
import {
  McpBuilder,
  createMcpServer,
  httpExecutor,
  createFetchHttpClient,
} from '@agrajag/mcp-adapter';
import { DefinitionCollection } from 'agrajag';

// One builder per origin/module; compose their tools into one server.
const tools = new McpBuilder()
  .addDefinitions(new DefinitionCollection().addDefinition(article).addDefinition(author))
  .build({
    namePrefix: 'blog',
    executor: httpExecutor({ baseUrl: 'https://host/api', http: createFetchHttpClient() }),
    writes: { create: true, update: true },   // reads always on; writes opt-in
  });

const { server } = createMcpServer(tools, { name: 'blog-mcp', version: '1.0.0' });
// register `server` with an MCP transport
```

## Executors — HTTP or in-process

How a tool's request is fulfilled is delegated to an `Executor`, mirroring
agrajag's two adapter styles:

- **`httpExecutor({ baseUrl, http })`** — cross-process: speaks JSON:API over an
  injected `HttpClient` (auth lives there). For MCP servers that front one or
  more API origins.
- **`inProcessExecutor()`** — co-deployed: invokes agrajag's endpoint handler
  directly, no HTTP. Runs inside the caller's context, so request-scoped concerns
  (transactions, row-level scoping, request-scoped auth) apply ambiently.
  Requires resolver-backed `endpoints`:

  ```ts
  new McpBuilder().addDefinitions(defs).build({
    namePrefix: 'blog',
    executor: inProcessExecutor(),
    endpoints: definition => myEndpointFactory.createEndpoints(definition, serializer),
  });
  ```

  (The HTTP executor never invokes the handler, so it doesn't need `endpoints`.)

## Generated tools

Reads, always on (gated only on the definition's capabilities):

- `<prefix>_<type>_list` — `filter`, `sort`, `include`, `fields`, `page`
- `<prefix>_<type>_get` — `id`, `include`, `fields`
- `<prefix>_<type>_<relationship>_get` — `id`; reads a relationship's linkage

Writes, **off by default** — enable per category via `writes`:

- `writes.create` → `<prefix>_<type>_create` — `attributes`, optional `id`, `relationships`
- `writes.update` → `<prefix>_<type>_update` — `id`, partial `attributes`, `relationships`
- `writes.delete` → `<prefix>_<type>_delete` — `id`
- `writes.relationships` → `<prefix>_<type>_<relationship>_set` (replace; to-one accepts `null`),
  and for to-many `_add` / `_remove`

`attributes` schemas come from the zod attribute schema (`toJSONSchema`).
`relationships` on create/update is a flat map (`{ author: "id", tags: ["id1","id2"] }`)
the adapter wraps into JSON:API linkage, filling the related `type` from the
definition; to-one accepts `null` to clear. `include`/`fields`/`sort` are emitted
as the comma-joined query the agrajag server parses; `filter` is passed through raw.

`page` drives cursor or offset pagination (cursor: `{ size, after | before }`
with cursors from the response `links`; offset: `{ number, size }`). The
response's top-level `links` (`next`/`prev`, plus `first`/`last` in offset mode)
let an agent walk pages.

The surface is read-only unless you opt in, and every write is still capability
gated by core — enabling `writes.delete` only adds delete tools for resources
that declare the Delete capability.

## Auth

The adapter is auth-agnostic: it speaks JSON:API over an injected `HttpClient`.
`createFetchHttpClient(headers?)` covers unauthenticated/static-token use;
implement `HttpClient` for stateful auth (cookie sessions, refreshing tokens).
