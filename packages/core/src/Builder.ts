import { z } from 'zod';

import { AttributesSchema } from './resources/ResourceSchema.js';
import { Serializer } from './serialization/Serializer.js';
import { JsonApiSerializer } from './serialization/JsonApiSerializer.js';
import {
  ResourceDefinition,
  ResourceRelationships,
} from './resources/ResourceDefinition.js';
import { ZodSchemaFactory } from './schema/ZodSchemaFactory.js';
import { CreateSchemaOptions, SchemaFactory } from './schema/SchemaFactory.js';
import { Response, ServerBuilder } from './server/ServerBuilder.js';

import { IEndpointFactory } from './endpoints/EndpointFactory.js';

export interface Logger {
  error: (error: Error) => void | Promise<void>;
}

export class Builder {
  readonly #serializer: Serializer = new JsonApiSerializer();
  readonly #schemaFactory: SchemaFactory = new ZodSchemaFactory();
  readonly #logger: Logger = console;

  constructor(options?: {
    serializer?: Serializer;
    schemaFactory?: SchemaFactory;
    logger?: Logger;
  }) {
    if (options?.serializer) {
      this.#serializer = options.serializer;
    }

    if (options?.schemaFactory) {
      this.#schemaFactory = options.schemaFactory;
    }

    if (options?.logger) {
      this.#logger = options.logger;
    }
  }

  createSchema<
    TType extends string = string,
    TAttributes extends AttributesSchema = AttributesSchema,
    TRelationships extends ResourceRelationships = ResourceRelationships,
  >(
    type: TType,
    createAttributesSchema: (zod: typeof z) => TAttributes,
    options?: CreateSchemaOptions<TRelationships>,
  ): ResourceDefinition<TType, TAttributes, TRelationships> {
    return this.#schemaFactory.createSchema(
      type,
      createAttributesSchema,
      options,
    );
  }

  addResource<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    factory: IEndpointFactory<TDefinition>,
    endpointBuilder: ServerBuilder,
  ): this {
    const type = definition.type;
    const endpoints = factory.createEndpoints(definition, this.#serializer);

    if (endpoints.fetch?.collection) {
      const endpoint = endpoints.fetch.collection;

      endpointBuilder.addGet(
        definition,
        this.#schemaFactory.createEndpointSchema(definition, {
          responseSchema:
            this.#schemaFactory.createArrayPrimaryTypeSchema(definition),
          noId: true,
        }),
        `/${type}`,
        async (params, respond) => {
          try {
            const body = await endpoint(params);

            await respond({
              body: body,
              status: body ? 200 : 400,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error);
            await respond(this.#createUnhandledErrorResponse(error));
          }
        },
      );
    }

    if (endpoints.fetch?.self) {
      const endpoint = endpoints.fetch.self;

      endpointBuilder.addGet(
        definition,
        this.#schemaFactory.createEndpointSchema(definition, {
          responseSchema:
            this.#schemaFactory.createSinglePrimaryTypeSchema(definition),
        }),
        `/${type}/:id`,
        async (params, respond) => {
          try {
            const body = await endpoint(params);

            await respond({
              body,
              status: body ? 200 : 404,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error);
            await respond(this.#createUnhandledErrorResponse(error));
          }
        },
      );
    }

    if (endpoints.create?.self) {
      endpointBuilder.addPost(
        definition,
        this.#schemaFactory.createEndpointSchema(definition, {
          requestSchema: this.#schemaFactory.createSinglePrimaryTypeSchema(
            definition,
            { partialAttributes: true, optionalId: true },
          ),
          responseSchema:
            this.#schemaFactory.createSinglePrimaryTypeSchema(definition),
          noId: true,
        }),
        `/${type}`,
        async (body, params, respond) => {
          try {
            const data = await endpoints.create!.self!(
              this.#schemaFactory.createUpdateSchema(definition).parse(body),
              params,
            );

            await respond({
              body: data,
              status: 201,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error);
            await respond(this.#createUnhandledErrorResponse(error));
          }
        },
      );
    }

    if (endpoints.patch?.self) {
      endpointBuilder.addPatch(
        definition,
        this.#schemaFactory.createEndpointSchema(definition, {
          requestSchema: this.#schemaFactory.createSinglePrimaryTypeSchema(
            definition,
            { partialAttributes: true },
          ),
          responseSchema:
            this.#schemaFactory.createSinglePrimaryTypeSchema(definition),
        }),
        `/${type}/:id`,
        async (body, params, respond) => {
          try {
            const data = await endpoints.patch!.self!(
              this.#schemaFactory.createUpdateSchema(definition).parse(body),
              params,
            );
            if (!data) {
              return await respond({ status: 404 });
            }

            await respond({
              body: data,
              status: 200,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error);
            await respond(this.#createUnhandledErrorResponse(error));
          }
        },
      );
    }

    if (endpoints.delete?.self) {
      endpointBuilder.addDelete(
        definition,
        this.#schemaFactory.createEndpointSchema(definition, {
          responseSchema:
            this.#schemaFactory.createSinglePrimaryTypeSchema(definition),
        }),
        `/${type}/:id`,
        async (params, respond) => {
          try {
            const data = await endpoints.delete!.self!(params);
            if (!data) {
              return await respond({ status: 404 });
            }

            await respond({
              body: data,
              status: 200,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error);
            await respond(this.#createUnhandledErrorResponse(error));
          }
        },
      );
    }

    const relationships = definition.relationships;

    for (const [key, oneOrMany] of Object.entries(relationships)) {
      const relationship = Array.isArray(oneOrMany) ? oneOrMany[0] : oneOrMany;

      endpointBuilder.addGet(
        relationship,
        this.#schemaFactory.createEndpointSchema(definition),
        `/${type}/:id/relationships/${key}`,
        async (params, respond) => {
          try {
            const data = await endpoints.fetch?.related?.[key](params);

            await respond({
              body: data,
              status: 200,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error);
            await respond(this.#createUnhandledErrorResponse(error));
          }
        },
      );

      endpointBuilder.addPost(
        relationship,
        this.#schemaFactory.createEndpointSchema(definition),
        `/${type}/:id/relationships/${key}`,
        async (body, params, respond) => {
          try {
            //fixme: data is not denormalized
            const data = (await endpoints.create?.related?.[key](
              body as any,
              params,
            )) as any;

            if (!data) {
              return await respond({ status: 404 });
            }

            await respond({
              body: this.#serializer.serialize(relationship, data.data, params),
              status: 200,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error);
            await respond(this.#createUnhandledErrorResponse(error));
          }
        },
      );

      endpointBuilder.addPatch(
        relationship,
        this.#schemaFactory.createEndpointSchema(definition),
        `/${type}/:id/relationships/${key}`,
        async (body, params, respond) => {
          try {
            //fixme: data is not denormalized
            const data = (await endpoints.patch?.related?.[key](
              body as any,
              params,
            )) as any;

            if (!data) {
              return await respond({ status: 404 });
            }

            await respond({
              body: this.#serializer.serialize(relationship, data.data, params),
              status: 200,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error);
            await respond(this.#createUnhandledErrorResponse(error));
          }
        },
      );

      // NOTE: this should be possible only if it is a one-to-many relationship
      endpointBuilder.addDelete(
        relationship,
        this.#schemaFactory.createEndpointSchema(definition),
        `/${type}/:id/relationships/${key}`,
        async (params, respond) => {
          try {
            const data = await endpoints.delete?.related?.[key](params);

            await respond({
              body: data,
              status: 200,
              headers: { 'Content-Type': 'application/vnd.api+json' },
            });
          } catch (error) {
            await this.#logError(error);
            await respond(this.#createUnhandledErrorResponse(error));
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
