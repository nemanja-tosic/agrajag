// Shared helpers for turning a ResourceDefinition into MCP tool input schemas
// and JSON:API request shapes. The actual tool wiring lives in McpServerBuilder,
// driven by core's Builder.addResource (capability gating + path scheme).
import type { ResourceDefinition } from 'agrajag';
import { toJSONSchema } from 'zod';

export type JsonSchema = Record<string, unknown>;

export interface GeneratedTool {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  handler: (args: Record<string, unknown>) => Promise<string>;
}

export interface RelationshipMeta {
  key: string;
  toMany: boolean;
  relatedType: string;
}

export function relationshipMetas(definition: ResourceDefinition): RelationshipMeta[] {
  return Object.entries(definition.relationships).map(([key, value]) => ({
    key,
    toMany: Array.isArray(value),
    relatedType: (Array.isArray(value) ? value[0] : value).type,
  }));
}

export function attributesJsonSchema(definition: ResourceDefinition, partial: boolean): JsonSchema {
  const zodSchema = partial
    ? definition.schema.shape.attributes.partial()
    : definition.schema.shape.attributes;
  const { $schema: _, ...schema } = toJSONSchema(zodSchema, { reused: 'inline' }) as {
    $schema?: string;
  } & JsonSchema;
  return schema;
}

// JSON:API query params the agrajag server understands. It parses the query with
// `qs.parse(query, { comma: true })`, so `include` and each `fields[type]` are
// comma-joined, and `filter` is passed through raw (app-interpreted). NOTE: there
// is intentionally NO pagination here — agrajag's query layer has no `page[...]`
// support, so emitting it would be silently dropped by the server.
export interface ListQuery {
  filter?: unknown;
  sort?: unknown;
  include?: unknown;
  fields?: unknown;
}

export function buildQuery(args: ListQuery): string {
  const params = new URLSearchParams();
  if (typeof args.filter === 'string' && args.filter) params.set('filter', args.filter);
  if (typeof args.sort === 'string' && args.sort) params.set('sort', args.sort);
  if (Array.isArray(args.include) && args.include.length) {
    params.set('include', args.include.map(String).join(','));
  }
  if (args.fields && typeof args.fields === 'object') {
    for (const [type, value] of Object.entries(args.fields as Record<string, unknown>)) {
      const list = Array.isArray(value) ? value.map(String).join(',') : String(value);
      if (list) params.set(`fields[${type}]`, list);
    }
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function includeSchema(rels: RelationshipMeta[]): JsonSchema {
  const available = rels.map(r => r.key);
  return {
    type: 'array',
    items: { type: 'string' },
    description: available.length
      ? `Relationship paths to include (sideload). Available: ${available.join(', ')}. Dotted paths (e.g. "${available[0]}.x") allowed for nested includes.`
      : 'Relationship paths to include. This resource has no relationships.',
  };
}

export const fieldsSchema: JsonSchema = {
  type: 'object',
  description:
    'Sparse fieldsets per resource type, e.g. {"<type>":"name,age"} — comma-separated attribute names limit which fields come back.',
  additionalProperties: { type: 'string' },
};

export function relationshipsSchema(rels: RelationshipMeta[]): JsonSchema {
  return {
    type: 'object',
    description: 'Relationship linkage by name; provide the related resource id(s).',
    properties: Object.fromEntries(
      rels.map(r => [
        r.key,
        r.toMany
          ? { type: 'array', items: { type: 'string' }, description: `ids of ${r.relatedType}` }
          : { type: ['string', 'null'], description: `id of ${r.relatedType} (null to clear)` },
      ]),
    ),
    additionalProperties: false,
  };
}

// Build the JSON:API `relationships` member from the flat {key: id | id[]} input.
export function buildRelationships(
  rels: RelationshipMeta[],
  input: unknown,
): Record<string, { data: unknown }> {
  const out: Record<string, { data: unknown }> = {};
  if (!input || typeof input !== 'object') {
    return out;
  }
  const provided = input as Record<string, unknown>;
  for (const rel of rels) {
    if (!(rel.key in provided)) {
      continue;
    }
    const value = provided[rel.key];
    if (rel.toMany) {
      const ids = Array.isArray(value) ? value : [];
      out[rel.key] = { data: ids.map(id => ({ type: rel.relatedType, id: String(id) })) };
    } else {
      out[rel.key] = { data: value == null ? null : { type: rel.relatedType, id: String(value) } };
    }
  }
  return out;
}

export async function responseText(response: Response): Promise<string> {
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${body}`);
  }
  return body || '(empty response)';
}
