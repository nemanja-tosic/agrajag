import { Serializer } from './serialization/Serializer.js';
import { JsonApiSerializer } from './serialization/JsonApiSerializer.js';
import {
  ResourceCapabilities,
  ResourceDefinition,
} from './resources/ResourceDefinition.js';
import { ResolverQueryParams, User } from './application/Resolver.js';
import { ZodSchemaFactory } from './schema/ZodSchemaFactory.js';
import { SchemaFactory } from './schema/SchemaFactory.js';
import { Response, ServerBuilder } from './server/ServerBuilder.js';
import { Definitions } from './api/Definitions.js';
import { DefinitionCollection } from './api/DefinitionCollection.js';
import { Endpoints } from './endpoints/Endpoints.js';

export interface Logger {
  error: (error: Error) => void | Promise<void>;
}

/**
 * Wraps every resolver invocation. Lets a consumer run the resolver inside its
 * own context — e.g. a per-request database transaction — so that when the
 * resolver throws, the consumer's wrapper (and its transaction) sees the error
 * and can roll back *before* the Builder catches it and renders the error
 * response. `params` is the resolver's query params (carrying the request user
 * etc.). Defaults to a passthrough that just runs the resolver.
 */
export type ResolverInvoke = <T>(
  run: () => Promise<T>,
  params: ResolverQueryParams<ResourceDefinition, User>,
) => Promise<T>;

export interface BuilderOptions {
  serializer?: Serializer;
  schemaFactory?: SchemaFactory;
  logger?: Logger;
  invoke?: ResolverInvoke;
}

export type DeferredRelationships = unknown;

export type UndeferredRelationships<
  TRelationships extends DeferredRelationships,
> = {
  [K in keyof TRelationships]: TRelationships[K] extends (...args: any[]) => any
    ? ReturnType<TRelationships[K]> extends any[]
      ? [ReturnType<TRelationships[K]>[number]]
      : ReturnType<TRelationships[K]>
    : never;
};

export abstract class Builder<TDefinitions extends Definitions = {}> {
  protected readonly serializer: Serializer = new JsonApiSerializer();

  protected definitions = new DefinitionCollection<TDefinitions>();
  protected endpointBuilder: ServerBuilder | undefined = undefined;

  readonly #schemaFactory: SchemaFactory = new ZodSchemaFactory();
  readonly #logger: Logger = console;
  readonly #invoke: ResolverInvoke = run => run();

  constructor(options?: BuilderOptions) {
    if (options?.serializer) {
      this.serializer = options.serializer;
    }
    if (options?.schemaFactory) {
      this.#schemaFactory = options.schemaFactory;
    }
    if (options?.logger) {
      this.#logger = options.logger;
    }
    if (options?.invoke) {
      this.#invoke = options.invoke;
    }
  }

  addEndpointBuilder(endpointBuilder: ServerBuilder): this {
    this.endpointBuilder = endpointBuilder;
    return this;
  }

  protected addResource<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    endpoints: Endpoints<TDefinition>,
  ): this {
    const serverBuilder = this.endpointBuilder;
    if (!serverBuilder) {
      throw new Error('endpointBuilder is not defined');
    }

    const type = definition.type;

    if (definition.capabilities & ResourceCapabilities.FetchCollection) {
      serverBuilder.addGet(
        definition,
        () =>
          this.#schemaFactory.createEndpointSchema(definition, {
            responseSchema: this.#schemaFactory.createArrayPrimaryTypeSchema(
              definition,
              { withDenormalize: true },
            ),
            noId: true,
          }),
        `/${type}`,
        async (params, respond) => {
          const endpoint = endpoints.fetch?.collection;
          if (!endpoint) {
            throw new Error('fetch.collection endpoint is not defined');
          }

          try {
            const body = await this.#invoke(() => endpoint(params), params);

            await respond({
              body: body,
              status: body ? 200 : 400,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error as Error);
            await respond(this.#createUnhandledErrorResponse(error as Error));
          }
        },
      );
    }

    if (definition.capabilities & ResourceCapabilities.FetchSelf) {
      serverBuilder.addGet(
        definition,
        () =>
          this.#schemaFactory.createEndpointSchema(definition, {
            responseSchema: this.#schemaFactory.createSinglePrimaryTypeSchema(
              definition,
              { withDenormalize: true },
            ),
          }),
        `/${type}/:id`,
        async (params, respond) => {
          const endpoint = endpoints.fetch?.self;
          if (!endpoint) {
            throw new Error('fetch.self endpoint is not defined');
          }

          try {
            const body = await this.#invoke(() => endpoint(params), params);

            await respond({
              body,
              status: body ? 200 : 404,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error as Error);
            await respond(this.#createUnhandledErrorResponse(error as Error));
          }
        },
      );
    }

    if (definition.capabilities & ResourceCapabilities.Create) {
      serverBuilder.addPost(
        definition,
        () =>
          this.#schemaFactory.createEndpointSchema(definition, {
            requestSchema: this.#schemaFactory.createSinglePrimaryTypeSchema(
              definition,
              { partialAttributes: true, optionalId: true },
            ),
            responseSchema: this.#schemaFactory.createSinglePrimaryTypeSchema(
              definition,
              { withDenormalize: true },
            ),
            noId: true,
          }),
        `/${type}`,
        async (body, params, respond) => {
          const endpoint = endpoints.create?.self;
          if (!endpoint) {
            throw new Error('create.self endpoint is not defined');
          }

          try {
            const data = await this.#invoke(
              () =>
                endpoint(
                  this.#schemaFactory.createUpdateSchema(definition).parse(body),
                  params,
                ),
              params,
            );
            if (!data) {
              return await respond({ status: 202 });
            }

            await respond({
              body: data,
              status: 201,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error as Error);
            await respond(this.#createUnhandledErrorResponse(error as Error));
          }
        },
      );
    }

    if (definition.capabilities & ResourceCapabilities.Update) {
      serverBuilder.addPatch(
        definition,
        () =>
          this.#schemaFactory.createEndpointSchema(definition, {
            requestSchema: this.#schemaFactory.createSinglePrimaryTypeSchema(
              definition,
              { partialAttributes: true },
            ),
            responseSchema: this.#schemaFactory.createSinglePrimaryTypeSchema(
              definition,
              { withDenormalize: true },
            ),
          }),
        `/${type}/:id`,
        async (body, params, respond) => {
          const endpoint = endpoints.patch?.self;
          if (!endpoint) {
            throw new Error('create.self endpoint is not defined');
          }

          try {
            const data = await this.#invoke(
              () =>
                endpoint(
                  this.#schemaFactory.createUpdateSchema(definition).parse(body),
                  params,
                ),
              params,
            );
            if (!data) {
              return await respond({ status: 202 });
            }

            await respond({
              body: data,
              status: 200,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error as Error);
            await respond(this.#createUnhandledErrorResponse(error as Error));
          }
        },
      );
    }

    if (definition.capabilities & ResourceCapabilities.Delete) {
      serverBuilder.addDelete(
        definition,
        () =>
          this.#schemaFactory.createEndpointSchema(definition, {
            responseSchema: this.#schemaFactory.createSinglePrimaryTypeSchema(
              definition,
              { withDenormalize: true },
            ),
          }),
        `/${type}/:id`,
        async (body, params, respond) => {
          const endpoint = endpoints.delete?.self;
          if (!endpoint) {
            throw new Error('delete.self endpoint is not defined');
          }

          try {
            const data = await this.#invoke(() => endpoint(params), params);
            if (!data) {
              return await respond({ status: 202 });
            }

            await respond({
              body: data,
              status: 200,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error as Error);
            await respond(this.#createUnhandledErrorResponse(error as Error));
          }
        },
      );
    }

    const relationships = definition.relationships;
    const visited = new Set<ResourceDefinition>();

    for (const [key, oneOrMany] of Object.entries(relationships)) {
      const relationship = Array.isArray(oneOrMany) ? oneOrMany[0] : oneOrMany;
      if (visited.has(relationship)) {
        continue;
      }

      visited.add(relationship);

      serverBuilder.addGet(
        relationship,
        () => this.#schemaFactory.createEndpointSchema(definition),
        `/${type}/:id/relationships/${key}`,
        async (params, respond) => {
          try {
            const data = await this.#invoke(
              async () => endpoints.fetch?.related?.[key](params as any),
              params,
            );

            await respond({
              body: data,
              status: 200,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error as Error);
            await respond(this.#createUnhandledErrorResponse(error as Error));
          }
        },
      );

      serverBuilder.addPost(
        relationship,
        () =>
          this.#schemaFactory.createEndpointSchema(definition, {
            requestSchema: Array.isArray(oneOrMany)
              ? this.#schemaFactory.createResourceMultiLinkageSchema(
                  relationship,
                )
              : this.#schemaFactory.createSinglePrimaryTypeSchema(relationship),
            responseSchema: Array.isArray(oneOrMany)
              ? this.#schemaFactory.createArrayPrimaryTypeSchema(definition, {
                  withDenormalize: true,
                })
              : this.#schemaFactory.createSinglePrimaryTypeSchema(definition, {
                  withDenormalize: true,
                }),
          }),
        `/${type}/:id/relationships/${key}`,
        async (body, params, respond) => {
          try {
            //fixme: data is not denormalized
            const data = (await this.#invoke(
              async () =>
                endpoints.create?.related?.[key](body as any, params as any),
              params,
            )) as any;

            if (!data) {
              return await respond({ status: 202 });
            }

            await respond({
              body: this.serializer.serialize(relationship, data.data, params),
              status: 200,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error as Error);
            await respond(this.#createUnhandledErrorResponse(error as Error));
          }
        },
      );

      serverBuilder.addPatch(
        relationship,
        () =>
          this.#schemaFactory.createEndpointSchema(definition, {
            requestSchema: Array.isArray(oneOrMany)
              ? this.#schemaFactory.createResourceMultiLinkageSchema(
                  relationship,
                )
              : this.#schemaFactory.createSinglePrimaryTypeSchema(relationship),
            responseSchema: Array.isArray(oneOrMany)
              ? this.#schemaFactory.createArrayPrimaryTypeSchema(definition, {
                  withDenormalize: true,
                })
              : this.#schemaFactory.createSinglePrimaryTypeSchema(definition, {
                  withDenormalize: true,
                }),
          }),
        `/${type}/:id/relationships/${key}`,
        async (body, params, respond) => {
          try {
            //fixme: data is not denormalized
            const data = (await this.#invoke(
              async () =>
                endpoints.patch?.related?.[key](body as any, params as any),
              params,
            )) as any;

            if (!data) {
              return await respond({ status: 202 });
            }

            await respond({
              body: this.serializer.serialize(relationship, data.data, params),
              status: 200,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error as Error);
            await respond(this.#createUnhandledErrorResponse(error as Error));
          }
        },
      );

      // NOTE: this should be possible only if it is a one-to-many relationship
      serverBuilder.addDelete(
        relationship,
        () =>
          this.#schemaFactory.createEndpointSchema(definition, {
            requestSchema: Array.isArray(oneOrMany)
              ? this.#schemaFactory.createResourceMultiLinkageSchema(
                  relationship,
                )
              : this.#schemaFactory.createSinglePrimaryTypeSchema(relationship),
            responseSchema: Array.isArray(oneOrMany)
              ? this.#schemaFactory.createArrayPrimaryTypeSchema(definition, {
                  withDenormalize: true,
                })
              : this.#schemaFactory.createSinglePrimaryTypeSchema(definition, {
                  withDenormalize: true,
                }),
          }),
        `/${type}/:id/relationships/${key}`,
        async (body, params, respond) => {
          try {
            const data = await this.#invoke(
              async () =>
                endpoints.delete?.related?.[key](body as any, params as any),
              params,
            );

            await respond({
              body: data as any,
              status: 200,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error as Error);
            await respond(this.#createUnhandledErrorResponse(error as Error));
          }
        },
      );
    }

    return this;
  }

  async #logError(error: Error): Promise<void> {
    this.#logger.error(error);
  }

  #createUnhandledErrorResponse(error: Error): Response {
    return {
      body: {
        errors: [
          {
            status: '500',
            detail: 'An unexpected error occurred',
            title: 'Internal Server Error',
          },
        ],
      },
      status: 500,
    };
  }
}
