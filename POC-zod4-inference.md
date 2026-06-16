# POC: agrajag zod 3 → zod 4 (inference rewrite)

Branch: `poc/zod4-inference`. Goal: prove agrajag can move to zod 4 by rewriting
the output-inference layer around the wontfix issue **colinhacks/zod#4619
("[v4] Object inference in generic contexts")**.

## Method

`packages/core` only. Flipped its 7 `from 'zod'` imports to the zod 4 bridge
(`from 'zod/v4'`, available from the installed zod 3.25.76 — no dep bump needed
for the POC). Checked with a standalone, non-incremental config
(`packages/core/tsconfig.poc.json`) over `src/**` + `tests-d/**`.

> Note: the package's normal `tsc` is `composite`/`incremental`, which silently
> caches and reports 0 errors on re-run. The POC config disables both so each run
> is a true check.

## The break (baseline under zod 4): 29 errors, 4 buckets

| Bucket | # | Cause |
|---|---|---|
| `endpoints/BaseEndpointFactory.ts` | 11 | **#4619** — `Stored`/`Denormalized`/`MutateEndpointBody` derive output via `z.infer<…composed generic ZodObject…>`, which collapses to `{}` under v4 (`Property 'data' does not exist on type '{}'`). |
| `schema/ZodSchemaFactory.ts` | 12 | Mostly **zod-openapi** (`.openapi()`, `extendZodWithOpenApi`) not applying under v4; plus 1 `ZodLazy['schema']` runtime access (removed in v4). |
| `resources/ResourceSchema.ts` | 2 | `GetRelationshipsShape` walks `…['relationships']['schema']['shape']`; v4 removed `ZodLazy['schema']`. |
| `server/OpenApiEndpointBuilderDecorator.ts` | 4 | **zod-openapi** (external dep) is v3-only. |

## The fix (inference) and result

**Thesis:** v4 only breaks *object output inference over generic schemas*.
`z.infer<SingleSchema>` still resolves generically. So derive output by mapping
the shape **per leaf**, never by inferring through a composed generic object.

Changes (type-level only, runtime composition untouched):

- `endpoints/Endpoints.ts` — added `InferShape<S>` (optional-aware per-leaf map:
  `{[K as required]: Out<S[K]>} & {[K as optional]?: Out<S[K]>}`). Rewrote
  `Stored`, `Denormalized`, and `MutateEndpointBody` to use it instead of
  `z.infer<IdPlusAttributes<…>>` / `z.infer<UpdateSchema<…>>`.
- `resources/ResourceSchema.ts` — `GetRelationshipsShape` now derives from the
  definition's `relationships` record (names are all `UpdateSchema` needs),
  sidestepping `ZodLazy['schema']`.

**Result: 29 → 18 errors.** The inference buckets are gone:

- `BaseEndpointFactory.ts`: 11 → 1 (the one left is a relationship-resolver
  `string[]` mismatch, not output inference).
- `ResourceSchema.ts`: 2 → 0.

Proven by `tests-d/poc-zod4-inference.test-d.ts`: `Stored`/`Denormalized` now
infer the concrete attribute fields (required vs optional, wrong-type rejected,
unknown-key rejected). The file is self-validating — its `@ts-expect-error`
directives only pass if the fields are really inferred; if output had collapsed
to `{}`/`any` they'd be flagged unused. Sanity-checked: assigning `{ id }` to
`Stored<typeof player>` is correctly rejected.

## What remains (18) — none is the inference problem

1. **zod-openapi (~14, the bulk)** — external dependency with no zod-4 build
   (`.openapi()`, `extendZodWithOpenApi`, the OpenApi decorator). Needs a
   v4-compatible zod-openapi release or to be made optional. Not agrajag inference.
2. **1× `ZodLazy['schema']` runtime access** (`ZodSchemaFactory.ts:115`) —
   mechanical: use the v4 lazy-unwrap.
3. **3× static↔runtime parse bridge** (`Builder.ts:185,232`,
   `BaseEndpointFactory.ts:347`) — `schemaFactory.createUpdateSchema(def).parse(body)`
   returns the runtime (still-composed) infer, which no longer matches the mapped
   `MutateEndpointBody`. Resolve by typing `createUpdateSchema`'s return / casting
   the parse result to the mapped body type.

## Conclusion

The blocker (#4619) is **resolvable** without zod's help, by moving output
derivation from "infer-through-composed-generic-object" to "map-the-shape." The
remaining v4 work is a bounded, well-understood list whose largest item is the
**zod-openapi** dependency, not agrajag's own inference. A full migration would:
bump `zod` to `^4` (import from `'zod'`, drop the `/v4` bridge), apply the same
per-leaf mapping to the few remaining `z.infer<composed>` sites, port the runtime
`_def`/`ZodLazy` access to `_zod.def`, and resolve zod-openapi.

_POC artifacts: `packages/core/tsconfig.poc.json`,
`packages/core/tests-d/poc-zod4-inference.test-d.ts`, and the edits above._

---

## Update — `core` fully migrated to zod 4 (0 errors, tests green)

Went past the POC: did the real dep bump and finished `packages/core`.

- **Deps:** `zod` `3.25.76 → 4.1.13`, `zod-openapi` `2.19.0 → 6.0.0`; imports back on
  `'zod'` (dropped the `/v4` bridge); peer `zod ^4.0.0`.
- **Inference:** kept the map-the-shape rewrite; hoisted `id: string` out of the
  mapped type (a conditional key-remap defers under a fully-generic `TDefinition`,
  which hid `id` in adapter generic contexts); and made `InferShape` yield a
  permissive `Record<string, unknown>` for the WIDE default shape
  (`string extends keyof S`) so specific `…<TDefinition>` stays assignable to the
  wide `…<ResourceDefinition>` adapters pass around.
- **zod-openapi 6 / zod 4 API:** `ZodLazy.schema → .unwrap()`; `.deepPartial()`
  (removed in v4) → `.partial()`; dropped `extendZodWithOpenApi`; `.openapi({…})`
  → zod 4 native `.meta({…})` (and `{ref}` → `{id}`).

**`packages/core`: 0 type errors, `yarn build` clean, `mocha` 13 passing, `tsd`
passing** (incl. the proof + the existing `Endpoints.test-d.ts`).

### Adapters — DONE. Whole repo now at 0.

The wide-variance fix cleared the bulk; the rest were small adapter-specific items:

- **ravendb `RavendbCrudEndpointFactory`** — its RavenDB queries were typed
  `Denormalized<TDefinition>`, but the `Resolver` contract (and a raw stored doc
  with relationship *refs*) is `Stored<TDefinition>`. Switched the 3 query
  generics `Denormalized → Stored`. zod 3's loose infer had made them
  interchangeable; they're now correctly distinct.
- **redux `ReduxServerBuilder`** — two `.id` reads on a related-entity value that,
  for the wide default `Denormalized<ResourceDefinition>`, types as `{}`; cast to
  `{ id: string }` at that internal access.
- The earlier `TS6305`/`TS2307`/`TS7006` were workspace build-order artifacts; they
  resolve once deps build in topo order (the real `yarn build` does).

express/fastify adapters have no direct zod usage and were unaffected.

## Final state

`yarn build`: **0 errors across all packages.** `yarn test`: core **mocha 13
passing** + **tsd passing**, redux **tsd passing** (ravendb/express/fastify have
no test scripts). The whole repo is migrated to zod 4.1.13 + zod-openapi 6.0.0.

