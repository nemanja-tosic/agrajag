# @agrajag/mcp-adapter

Expose agrajag `ResourceDefinition`s as [Model Context Protocol](https://modelcontextprotocol.io)
tools. Like the other adapters it plugs into agrajag's `Builder`: core's
capability gating and path scheme drive an `McpServerBuilder` that emits one set
of tools per resource, with input schemas derived from the resource's zod
attributes and relationship graph. No per-resource code.

```ts
import { McpBuilder, createMcpServer, createFetchHttpClient } from '@agrajag/mcp-adapter';
import { DefinitionCollection } from 'agrajag';

const http = createFetchHttpClient();            // or your own HttpClient (cookies, tokens, …)

// One builder per origin/module; compose their tools into one server.
const tools = new McpBuilder()
  .addDefinitions(new DefinitionCollection().addDefinition(article).addDefinition(author))
  .build({
    namePrefix: 'blog',
    baseUrl: 'https://host/api',
    http,
    writes: { create: true, update: true },   // reads always on; writes opt-in
  });

const { server } = createMcpServer(tools, { name: 'blog-mcp', version: '1.0.0' });
// register `server` with an MCP transport
```

## Generated tools

Reads, always on (gated only on the definition's capabilities):

- `<prefix>_<type>_list` — `filter`, `sort`, `include`, `fields`
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

The surface is read-only unless you opt in, and every write is still capability
gated by core — enabling `writes.delete` only adds delete tools for resources
that declare the Delete capability.

### Not generated

- **Pagination** — agrajag's query layer has no `page[...]` support, so emitting
  page params would be silently dropped. Add it to agrajag core first.

## Auth

The adapter is auth-agnostic: it speaks JSON:API over an injected `HttpClient`.
`createFetchHttpClient(headers?)` covers unauthenticated/static-token use;
implement `HttpClient` for stateful auth (cookie sessions, refreshing tokens).
