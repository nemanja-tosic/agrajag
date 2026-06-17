import {
  EndpointOperation,
  EndpointSchema,
  JsonApiDeserializer,
  QueryParams,
  ResourceDefinition,
  ServerBuilder,
} from 'agrajag';
import type { Executor, TransportRequest } from './Executor.js';
import {
  attributesJsonSchema,
  buildQuery,
  buildRelationships,
  fieldsSchema,
  GeneratedTool,
  includeSchema,
  relationshipMetas,
  relationshipsSchema,
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
  /** How tool requests are fulfilled (HTTP client or in-process). */
  executor: Executor;
  /**
   * Which write tools to expose. Reads (list/get and relationship reads) are
   * always on; every write defaults to false, so the tool surface is read-only
   * unless you opt in. Writes are destructive and easy for an agent to call by
   * accident — enable deliberately, per module.
   */
  writes?: McpWriteOptions;
}

type Handler = (...args: any[]) => unknown;

/**
 * Maps agrajag's resource endpoints onto MCP tools, driven by core's
 * Builder.addResource — capability gating, paths, and the endpoint `operation`
 * all come from there. How a tool's request is fulfilled is delegated to an
 * Executor, so the same tools work over HTTP (cross-process) or in-process.
 *
 * Reads (list/get and relationship `_get`) are always emitted; writes
 * (create/update/delete and relationship `_set`/`_add`/`_remove`) are opt-in via
 * `writes`.
 */
export class McpServerBuilder extends ServerBuilder {
  readonly tools: GeneratedTool[] = [];

  readonly #prefix: string;
  readonly #executor: Executor;
  readonly #writes: Required<McpWriteOptions>;
  readonly #deserializer = new JsonApiDeserializer();

  constructor(options: McpServerBuilderOptions) {
    super();
    this.#prefix = options.namePrefix;
    this.#executor = options.executor;
    this.#writes = {
      create: options.writes?.create ?? false,
      update: options.writes?.update ?? false,
      delete: options.writes?.delete ?? false,
      relationships: options.writes?.relationships ?? false,
    };
  }

  addGet(
    definition: ResourceDefinition,
    _schema: () => EndpointSchema,
    path: string,
    handler: Handler,
    operation: EndpointOperation,
  ): void {
    if (operation.kind === 'collection') {
      this.#listTool(definition, path, handler);
    } else if (operation.kind === 'entity') {
      this.#getTool(definition, path, handler);
    } else if (operation.kind === 'relationship') {
      this.#relationshipReadTool(definition, path, handler, operation);
    }
  }

  addPost(
    definition: ResourceDefinition,
    _schema: () => EndpointSchema,
    path: string,
    handler: Handler,
    operation: EndpointOperation,
  ): void {
    if (operation.kind === 'create') {
      if (this.#writes.create) {
        this.#createTool(definition, path, handler);
      }
    } else if (
      operation.kind === 'relationship' &&
      operation.cardinality === 'many' &&
      this.#writes.relationships
    ) {
      this.#relationshipWriteTool('add', 'POST', definition, path, handler, operation);
    }
  }

  addPatch(
    definition: ResourceDefinition,
    _schema: () => EndpointSchema,
    path: string,
    handler: Handler,
    operation: EndpointOperation,
  ): void {
    if (operation.kind === 'update') {
      if (this.#writes.update) {
        this.#updateTool(definition, path, handler);
      }
    } else if (operation.kind === 'relationship' && this.#writes.relationships) {
      this.#relationshipWriteTool('set', 'PATCH', definition, path, handler, operation);
    }
  }

  addDelete(
    definition: ResourceDefinition,
    _schema: () => EndpointSchema,
    path: string,
    handler: Handler,
    operation: EndpointOperation,
  ): void {
    if (operation.kind === 'delete') {
      if (this.#writes.delete) {
        this.#deleteTool(definition, path, handler);
      }
    } else if (
      operation.kind === 'relationship' &&
      operation.cardinality === 'many' &&
      this.#writes.relationships
    ) {
      this.#relationshipWriteTool('remove', 'DELETE', definition, path, handler, operation);
    }
  }

  #name(type: string, action: string): string {
    return `${this.#prefix}_${type}_${action}`;
  }

  #params(args: Record<string, unknown>): QueryParams & { id?: string } {
    const params: QueryParams & { id?: string } = {};
    if (args.id != null) params.id = String(args.id);
    if (Array.isArray(args.include)) params.include = args.include.map(String);
    if (typeof args.sort === 'string') params.sort = args.sort as never;
    if (typeof args.filter === 'string') params.filter = args.filter;
    if (args.fields && typeof args.fields === 'object') {
      params.fields = Object.fromEntries(
        Object.entries(args.fields as Record<string, unknown>).map(([type, value]) => [
          type,
          String(value).split(','),
        ]),
      ) as never;
    }
    return params;
  }

  // Build the transport request (both HTTP and in-process representations), send
  // it via the executor, and format the JSON:API document for the tool result.
  async #send(
    args: Record<string, unknown>,
    options: {
      method: TransportRequest['method'];
      path: string;
      handler: Handler;
      definition: ResourceDefinition;
      deserialize: boolean;
      body?: unknown;
    },
  ): Promise<string> {
    const { method, handler, definition, deserialize, body } = options;
    const id = args.id != null ? String(args.id) : undefined;
    const path = options.path.replace(':id', encodeURIComponent(id ?? ''));
    const query = method === 'GET' ? buildQuery(args) : '';
    const params = this.#params(args);

    const runInProcess = () =>
      new Promise<{ body?: unknown; status: number }>((resolve, reject) => {
        const respond = async (response: { body?: unknown; status: number }) => {
          resolve(response);
        };
        try {
          const ran = method === 'GET' ? handler(params, respond) : handler(body, params, respond);
          Promise.resolve(ran).catch(reject);
        } catch (error) {
          reject(error);
        }
      });

    const document = await this.#executor.send({ method, path, query, body, runInProcess });
    if (document == null) {
      return '(empty response)';
    }
    if (deserialize) {
      const result = await this.#deserializer.deserialize(definition, document as never, params);
      return JSON.stringify(result, null, 2);
    }
    return JSON.stringify(document, null, 2);
  }

  #listTool(definition: ResourceDefinition, path: string, handler: Handler): void {
    const rels = relationshipMetas(definition);
    const type = definition.type;
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
      handler: args => this.#send(args, { method: 'GET', path, handler, definition, deserialize: true }),
    });
  }

  #getTool(definition: ResourceDefinition, path: string, handler: Handler): void {
    const rels = relationshipMetas(definition);
    const type = definition.type;
    this.tools.push({
      name: this.#name(type, 'get'),
      description: `Get one ${type} resource by id (${this.#prefix}).`,
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string' }, include: includeSchema(rels), fields: fieldsSchema },
        required: ['id'],
        additionalProperties: false,
      },
      handler: args => this.#send(args, { method: 'GET', path, handler, definition, deserialize: true }),
    });
  }

  #createTool(definition: ResourceDefinition, path: string, handler: Handler): void {
    const rels = relationshipMetas(definition);
    const type = definition.type;
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
      handler: args =>
        this.#send(args, {
          method: 'POST',
          path,
          handler,
          definition,
          deserialize: true,
          body: {
            data: {
              ...(typeof args.id === 'string' ? { id: args.id } : {}),
              type,
              attributes: args.attributes,
              relationships: buildRelationships(rels, args.relationships),
            },
          },
        }),
    });
  }

  #updateTool(definition: ResourceDefinition, path: string, handler: Handler): void {
    const rels = relationshipMetas(definition);
    const type = definition.type;
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
      handler: args =>
        this.#send(args, {
          method: 'PATCH',
          path,
          handler,
          definition,
          deserialize: true,
          body: {
            data: {
              id: args.id,
              type,
              attributes: args.attributes,
              relationships: buildRelationships(rels, args.relationships),
            },
          },
        }),
    });
  }

  #deleteTool(definition: ResourceDefinition, path: string, handler: Handler): void {
    const type = definition.type;
    this.tools.push({
      name: this.#name(type, 'delete'),
      description: `Delete a ${type} resource by id (${this.#prefix}).`,
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
        additionalProperties: false,
      },
      handler: args =>
        this.#send(args, { method: 'DELETE', path, handler, definition, deserialize: false }),
    });
  }

  #relationshipReadTool(
    relatedDefinition: ResourceDefinition,
    path: string,
    handler: Handler,
    operation: Extract<EndpointOperation, { kind: 'relationship' }>,
  ): void {
    this.tools.push({
      name: this.#name(operation.type, `${operation.key}_get`),
      description: `Read the "${operation.key}" relationship of a ${operation.type} (related ${relatedDefinition.type}). Returns JSON:API resource linkage.`,
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: `id of the ${operation.type}` } },
        required: ['id'],
        additionalProperties: false,
      },
      handler: args =>
        this.#send(args, {
          method: 'GET',
          path,
          handler,
          definition: relatedDefinition,
          deserialize: false,
        }),
    });
  }

  #relationshipWriteTool(
    action: 'set' | 'add' | 'remove',
    method: 'PATCH' | 'POST' | 'DELETE',
    relatedDefinition: ResourceDefinition,
    path: string,
    handler: Handler,
    operation: Extract<EndpointOperation, { kind: 'relationship' }>,
  ): void {
    const relatedType = relatedDefinition.type;
    const toMany = operation.cardinality === 'many';
    const verb = action === 'set' ? 'Replace' : action === 'add' ? 'Add to' : 'Remove from';

    const properties: Record<string, unknown> = {
      id: { type: 'string', description: `id of the ${operation.type}` },
    };
    if (toMany) {
      properties.relatedIds = { type: 'array', items: { type: 'string' }, description: `ids of ${relatedType}` };
    } else {
      properties.relatedId = { type: ['string', 'null'], description: `id of ${relatedType} (null to clear)` };
    }

    this.tools.push({
      name: this.#name(operation.type, `${operation.key}_${action}`),
      description: `${verb} the "${operation.key}" relationship of a ${operation.type} (related ${relatedType}).`,
      inputSchema: {
        type: 'object',
        properties,
        required: ['id', toMany ? 'relatedIds' : 'relatedId'],
        additionalProperties: false,
      },
      handler: args => {
        const data = toMany
          ? (Array.isArray(args.relatedIds) ? args.relatedIds : []).map(id => ({
              type: relatedType,
              id: String(id),
            }))
          : args.relatedId == null
            ? null
            : { type: relatedType, id: String(args.relatedId) };
        return this.#send(args, {
          method,
          path,
          handler,
          definition: relatedDefinition,
          deserialize: false,
          body: { data },
        });
      },
    });
  }
}
