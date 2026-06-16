# agrajag: zod 3 → zod 4 migration

Migrates agrajag to **zod 4.1.13 + zod-openapi 6.0.0**. The hard part was
**colinhacks/zod#4619 ("[v4] Object inference in generic contexts", closed
wontfix)** — agrajag derived its DTO output by inferring through generic-composed
zod objects, which zod 4 can no longer resolve. This documents the problem and
how it was worked around.

**Status:** whole repo at 0 type errors; `yarn test` green (core `mocha` 13
passing + `tsd`, redux `tsd`). `zod` peer is now `^4.0.0`.

## The blocker (#4619)

zod 4 cannot infer the OUTPUT of an object whose properties are generic schemas:

```ts
<T extends z.ZodType>(results: T) => z.strictObject({ results }).parse({}).results;
//                                                                       ^ unknown/{}
```

agrajag's `Stored`/`Denormalized`/`MutateEndpointBody` did exactly that —
`z.infer<ZodObject<{ id } & attrsShape>>` with a generic `attrsShape` — so under
zod 4 they collapsed to `{}` (`Property 'data' does not exist on type '{}'`).

## The fix: map the shape per-leaf

zod 4 only breaks *object output inference over generic schemas*; `z.infer` of a
*single* schema still resolves generically. So derive output by mapping the
attributes shape per leaf, never by inferring through a composed generic object
(`src/endpoints/Endpoints.ts`):

```ts
type Out<T> = T extends ZodType ? z.infer<T> : never;
type InferShape<S> = string extends keyof S
  ? Record<string, unknown>                       // wide default shape → permissive supertype
  : { [K in keyof S as IsOptionalSchema<S[K]> extends true ? never : K]: Out<S[K]> }
    & { [K in keyof S as IsOptionalSchema<S[K]> extends true ? K : never]?: Out<S[K]> };
```

Two refinements were required for fully-generic and wide-default contexts:

- **`id` hoisted out of the mapped type** (`{ id: string } & InferShape<…>`): a
  conditional key-remap defers under an unbound `TDefinition`, which otherwise hid
  `id` from `Stored<TDefinition>` inside the adapters' generic functions.
- **`Record<string, unknown>` for the wide default shape** (`string extends keyof
  S`): keeps a specific `…<TDefinition>` assignable to the wide
  `…<ResourceDefinition>` that adapters take as a parameter type. (zod 3's loose
  `z.infer<ZodObject<ZodRawShape>>` gave the same permissive supertype for free.)

`GetRelationshipsShape` was also rederived from the definition's `relationships`
record instead of walking `ZodLazy['schema']` (removed in v4).

This is verified by `tests-d/zod4-inference.test-d.ts`: `Stored`/`Denormalized`
infer the concrete attribute fields (required vs optional, wrong-type and
unknown-key rejected). It is self-validating — its `@ts-expect-error` directives
only pass if the fields are really inferred.

## zod 4 / zod-openapi 6 API ports

- `ZodLazy.schema` → `.unwrap()`.
- `.deepPartial()` (removed in v4) → `.partial()` (JSON:API attributes are flat).
- Dropped `extendZodWithOpenApi`; `.openapi({…})` → zod 4 native `.meta({…})`
  (`{ ref }` → `{ id }`). `createDocument` from zod-openapi 6 is unchanged.

## Adapters

- **ravendb `RavendbCrudEndpointFactory`** — its RavenDB queries were typed
  `Denormalized<TDefinition>`, but the `Resolver` contract returns
  `Stored<TDefinition>` (a raw stored doc carries relationship *refs* =
  `Stored`-shaped). Switched the 3 query generics to `Stored`. zod 3's loose infer
  had made the two interchangeable; they are now correctly distinct
  (`Denormalized` = optional relationship keys, `Stored` = required). **Worth a
  maintainer eye — it's a (correct) contract clarification.**
- **redux `ReduxServerBuilder`** — two `.id` reads on a related-entity value that,
  for the wide default `Denormalized<ResourceDefinition>`, types as `{}`; cast to
  `{ id: string }` at that internal access (no runtime change; the line was
  pre-existing). Alternative if casts are unwanted: tighten the wide-default
  fallback in `Denormalized`'s relationship branch (`: { id: string } | …`
  instead of `: {}`).
- express/fastify — no direct zod usage; unaffected.

## Notes

- Deferred release strategies are declared in `.yarn/versions/` (core `minor` for
  the breaking zod-4 peer change; adapters `patch`) — adjust via
  `yarn version check --interactive` per release policy.
- `module`/`moduleResolution: node16` is intentional and correct for a published
  Node ESM library (it enforces the extension + `exports` rules consumers apply).
