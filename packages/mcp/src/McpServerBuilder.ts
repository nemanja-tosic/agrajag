import {
  EndpointSchema,
  ResourceDefinition,
  ServerBuilder,
} from 'agrajag';
import type { HttpClient } from './HttpClient.js';
import {
  attributesJsonSchema,
  buildQuery,
  buildRelationships,
  fieldsSchema,
  GeneratedTool,
  includeSchema,
  relationshipMetas,
  relationshipsSchema,
  responseText,
} from './tools.js';

export interface McpWriteOptions {
  /** `<type>_create` tools. */
  create?: boolean;
  /** `<type>_update` tools. */
  update?: boolean;
  /** `<type>_delete` tools. */
  delete?: boolean;
  /** Relationship mutation tools (`<type>_<rel>_set`/`_add`/`_remove`). */
  relationships?: boolean;
}

export interface McpServerBuilderOptions {
  /** Tool-name prefix, e.g. "blog" -> tools named "blog_<type>_<action>". */
  namePrefix: string;
  /** Root the resources hang off; tools request `<baseUrl>/<type>...`. */
  baseUrl: string;
  http: HttpClient;
  /**
   * Which write tools to expose. Reads (list/get and relationship reads) are
   * always on; every write defaults to false, so the tool surface is read-only
   * unless you opt in. Writes are destructive and easy for an agent to call by
   * accident — enable deliberately, per module.
   */
  writes?: McpWriteOptions;
}

type ParsedPath =
  | { kind: 'collection'; type: string }
  | { kind: 'self'; type: string }
  | { kind: 'relationship'; type: string; key: string }
  | { kind: 'unknown' };

// Core builds paths as `/${type}`, `/${type}/:id`, and
// `/${type}/:id/relationships/${key}`. Recover the structure from the path so
// each add* call maps to the right tool — for relationship endpoints the parent
// type lives in the path (the definition arg is the *related* resource).
function parsePath(path: string): ParsedPath {
  let match: RegExpExecArray | null;
  if ((match = /^\/([^/]+)$/.exec(path))) {
    return { kind: 'collection', type: match[1]! };
  }
  if ((match = /^\/([^/]+)\/:id$/.exec(path))) {
    return { kind: 'self', type: match[1]! };
  }
  if ((match = /^\/([^/]+)\/:id\/relationships\/([^/]+)$/.exec(path))) {
    return { kind: 'relationship', type: match[1]!, key: match[2]! };
  }
  return { kind: 'unknown' };
}

/**
 * Maps agrajag's resource endpoints onto MCP tools. Like the redux adapter it is
 * a client: it ignores the server `handler` and builds its own request from
 * `(definition, path)`, getting capability gating and the path scheme from core's
 * Builder.addResource for free.
 *
 * Reads (list/get and relationship `_get`) are always emitted; write tools
 * (create/update/delete and relationship `_set`/`_add`/`_remove`) are opt-in via
 * `writes`, all off by default. Everything is capability gated by core first, so
 * enabling a write still only produces tools for resources that declare it.
 */
export class McpServerBuilder extends ServerBuilder {
  readonly tools: GeneratedTool[] = [];

  readonly #prefix: string;
  readonly #baseUrl: string;
  readonly #http: HttpClient;
  readonly #writes: Required<McpWriteOptions>;
  // Parent definitions by type, so relationship writes can resolve cardinality
  // (the add* arg is the *related* definition, which doesn't carry it).
  readonly #byType: Map<string, ResourceDefinition>;

  constructor(options: McpServerBuilderOptions, definitions: Iterable<ResourceDefinition>) {
    super();
    this.#prefix = options.namePrefix;
    this.#baseUrl = options.baseUrl.replace(/\/$/, '');
    this.#http = options.http;
    this.#writes = {
      create: options.writes?.create ?? false,
      update: options.writes?.update ?? false,
      delete: options.writes?.delete ?? false,
      relationships: options.writes?.relationships ?? false,
    };
    this.#byType = new Map([...definitions].map(definition => [definition.type, definition]));
  }

  addGet(definition: ResourceDefinition, _schema: () => EndpointSchema, path: string): void {
    const parsed = parsePath(path);
    if (parsed.kind === 'collection') {
      this.#addList(definition, parsed.type);
    } else if (parsed.kind === 'self') {
      this.#addGet(definition, parsed.type);
    } else if (parsed.kind === 'relationship') {
      this.#addRelationshipRead(definition, parsed.type, parsed.key);
    }
  }

  addPost(definition: ResourceDefinition, _schema: () => EndpointSchema, path: string): void {
    const parsed = parsePath(path);
    if (parsed.kind === 'collection') {
      if (this.#writes.create) {
        this.#addCreate(definition, definition.type);
      }
    } else if (
      parsed.kind === 'relationship' &&
      this.#writes.relationships &&
      this.#isToMany(parsed.type, parsed.key)
    ) {
      // POST to a relationship adds members — to-many only.
      this.#addRelationshipWrite('add', 'POST', definition, parsed.type, parsed.key, true);
    }
  }

  addPatch(definition: ResourceDefinition, _schema: () => EndpointSchema, path: string): void {
    const parsed = parsePath(path);
    if (parsed.kind === 'self') {
      if (this.#writes.update) {
        this.#addUpdate(definition, definition.type);
      }
    } else if (parsed.kind === 'relationship' && this.#writes.relationships) {
      // PATCH replaces the whole relationship (to-one or to-many).
      this.#addRelationshipWrite(
        'set',
        'PATCH',
        definition,
        parsed.type,
        parsed.key,
        this.#isToMany(parsed.type, parsed.key),
      );
    }
  }

  addDelete(definition: ResourceDefinition, _schema: () => EndpointSchema, path: string): void {
    const parsed = parsePath(path);
    if (parsed.kind === 'self') {
      if (this.#writes.delete) {
        this.#addDelete(definition.type);
      }
    } else if (
      parsed.kind === 'relationship' &&
      this.#writes.relationships &&
      this.#isToMany(parsed.type, parsed.key)
    ) {
      // DELETE from a relationship removes members — to-many only.
      this.#addRelationshipWrite('remove', 'DELETE', definition, parsed.type, parsed.key, true);
    }
  }

  #isToMany(parentType: string, key: string): boolean {
    return Array.isArray(this.#byType.get(parentType)?.relationships[key]);
  }

  #url(type: string, id?: string): string {
    const base = `${this.#baseUrl}/${type}`;
    return id === undefined ? base : `${base}/${encodeURIComponent(id)}`;
  }

  #relationshipUrl(parentType: string, id: string, key: string): string {
    return `${this.#url(parentType, id)}/relationships/${encodeURIComponent(key)}`;
  }

  #name(type: string, action: string): string {
    return `${this.#prefix}_${type}_${action}`;
  }

  #addList(definition: ResourceDefinition, type: string): void {
    const rels = relationshipMetas(definition);
    this.tools.push({
      name: this.#name(type, 'list'),
      description: `List ${type} (${this.#prefix}). Returns the JSON:API collection document.`,
      inputSchema: {
        type: 'object',
        properties: {
          filter: { type: 'string', description: 'JSON:API filter query value' },
          sort: { type: 'string', description: 'JSON:API sort, e.g. "-createdAt,name"' },
          include: includeSchema(rels),
          fields: fieldsSchema,
        },
        additionalProperties: false,
      },
      handler: async args => responseText(await this.#http.request(`${this.#url(type)}${buildQuery(args)}`)),
    });
  }

  #addGet(definition: ResourceDefinition, type: string): void {
    const rels = relationshipMetas(definition);
    this.tools.push({
      name: this.#name(type, 'get'),
      description: `Get one ${type} resource by id (${this.#prefix}).`,
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string' }, include: includeSchema(rels), fields: fieldsSchema },
        required: ['id'],
        additionalProperties: false,
      },
      handler: async args =>
        responseText(await this.#http.request(`${this.#url(type, String(args.id))}${buildQuery(args)}`)),
    });
  }

  #addCreate(definition: ResourceDefinition, type: string): void {
    const rels = relationshipMetas(definition);
    this.tools.push({
      name: this.#name(type, 'create'),
      description: `Create a ${type} resource (${this.#prefix}).`,
      inputSchema: {
        type: 'object',
        properties: {
          attributes: attributesJsonSchema(definition, false),
          id: { type: 'string', description: 'Optional client-generated id (uuid)' },
          ...(rels.length ? { relationships: relationshipsSchema(rels) } : {}),
        },
        required: ['attributes'],
        additionalProperties: false,
      },
      handler: async args =>
        responseText(
          await this.#http.request(this.#url(type), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: {
                ...(typeof args.id === 'string' ? { id: args.id } : {}),
                type,
                attributes: args.attributes,
                relationships: buildRelationships(rels, args.relationships),
              },
            }),
          }),
        ),
    });
  }

  #addUpdate(definition: ResourceDefinition, type: string): void {
    const rels = relationshipMetas(definition);
    this.tools.push({
      name: this.#name(type, 'update'),
      description: `Update a ${type} resource by id (${this.#prefix}). Send only the attributes/relationships to change.`,
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          attributes: attributesJsonSchema(definition, true),
          ...(rels.length ? { relationships: relationshipsSchema(rels) } : {}),
        },
        required: ['id', 'attributes'],
        additionalProperties: false,
      },
      handler: async args =>
        responseText(
          await this.#http.request(this.#url(type, String(args.id)), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: {
                id: args.id,
                type,
                attributes: args.attributes,
                relationships: buildRelationships(rels, args.relationships),
              },
            }),
          }),
        ),
    });
  }

  #addDelete(type: string): void {
    this.tools.push({
      name: this.#name(type, 'delete'),
      description: `Delete a ${type} resource by id (${this.#prefix}).`,
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
        additionalProperties: false,
      },
      handler: async args =>
        responseText(await this.#http.request(this.#url(type, String(args.id)), { method: 'DELETE' })),
    });
  }

  #addRelationshipRead(relatedDefinition: ResourceDefinition, parentType: string, key: string): void {
    this.tools.push({
      name: this.#name(parentType, `${key}_get`),
      description: `Read the "${key}" relationship of a ${parentType} (related ${relatedDefinition.type}). Returns JSON:API resource linkage.`,
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: `id of the ${parentType}` } },
        required: ['id'],
        additionalProperties: false,
      },
      handler: async args =>
        responseText(await this.#http.request(this.#relationshipUrl(parentType, String(args.id), key))),
    });
  }

  // PATCH (set/replace), POST (add), DELETE (remove) against a relationship's
  // linkage. to-one supports only `set` (nullable); to-many supports all three.
  #addRelationshipWrite(
    action: 'set' | 'add' | 'remove',
    method: 'PATCH' | 'POST' | 'DELETE',
    relatedDefinition: ResourceDefinition,
    parentType: string,
    key: string,
    toMany: boolean,
  ): void {
    const relatedType = relatedDefinition.type;
    const verb = action === 'set' ? 'Replace' : action === 'add' ? 'Add to' : 'Remove from';

    const properties: Record<string, unknown> = { id: { type: 'string', description: `id of the ${parentType}` } };
    if (toMany) {
      properties.relatedIds = {
        type: 'array',
        items: { type: 'string' },
        description: `ids of ${relatedType}`,
      };
    } else {
      properties.relatedId = { type: ['string', 'null'], description: `id of ${relatedType} (null to clear)` };
    }

    this.tools.push({
      name: this.#name(parentType, `${key}_${action}`),
      description: `${verb} the "${key}" relationship of a ${parentType} (related ${relatedType}).`,
      inputSchema: {
        type: 'object',
        properties,
        required: ['id', toMany ? 'relatedIds' : 'relatedId'],
        additionalProperties: false,
      },
      handler: async args => {
        const data = toMany
          ? (Array.isArray(args.relatedIds) ? args.relatedIds : []).map(id => ({
              type: relatedType,
              id: String(id),
            }))
          : args.relatedId == null
            ? null
            : { type: relatedType, id: String(args.relatedId) };
        return responseText(
          await this.#http.request(this.#relationshipUrl(parentType, String(args.id), key), {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data }),
          }),
        );
      },
    });
  }
}
