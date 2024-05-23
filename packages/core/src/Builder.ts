import { z } from 'zod';

import { AttributesSchema } from './resources/ResourceSchema.js';
import { Serializer } from './serialization/Serializer.js';
import { JsonApiSerializer } from './serialization/JsonApiSerializer.js';
import {
  ResourceDefinition,
  ResourceRelationships,
} from './resources/ResourceDefinition.js';
import { ZodSchemaFactory } from './schema/ZodSchemaFactory.js';
import { SchemaFactory } from './schema/SchemaFactory.js';
import { ServerBuilder } from './server/ServerBuilder.js';
import { HonoBuilder } from './server/HonoBuilder.js';
import { EndpointFactory } from './endpoints/createEndpoints.js';

export class Builder {
  #endpointBuilder: ServerBuilder = new HonoBuilder();
  #serializer: Serializer = new JsonApiSerializer();
  #schemaFactory: SchemaFactory = new ZodSchemaFactory();

  constructor(options?: {
    endpointBuilder?: ServerBuilder;
    serializer?: Serializer;
    schemaFactory?: SchemaFactory;
  }) {
    if (options?.endpointBuilder) {
      this.#endpointBuilder = options.endpointBuilder;
    }

    if (options?.serializer) {
      this.#serializer = options.serializer;
    }

    if (options?.schemaFactory) {
      this.#schemaFactory = options.schemaFactory;
    }
  }

  createSchema<
    TAttributes extends AttributesSchema = AttributesSchema,
    TRelationships extends ResourceRelationships = ResourceRelationships,
  >(
    type: string,
    createAttributesSchema: (zod: typeof z) => TAttributes,
    options?: { relationships?: TRelationships },
  ): ResourceDefinition<TAttributes, TRelationships> {
    return this.#schemaFactory.createSchema(
      type,
      createAttributesSchema,
      options,
    );
  }

  addResource<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    factory: EndpointFactory<TDefinition>,
  ): this {
    const type = definition.type;
    const endpoints = factory.createEndpoints(definition, this.#serializer);

    this.#endpointBuilder.addGet(
      definition,
      this.#schemaFactory.createEndpointsParamsSchema(),
      `/${type}`,
      async (params, respond) =>
        respond({
          body: await endpoints.fetch.collection(params),
          status: 200,
          headers: { 'Content-Type': 'application/vnd.api+json' },
        }),
    );

    this.#endpointBuilder.addGet(
      definition,
      this.#schemaFactory.createEndpointsParamsSchema(),
      `/${type}/:id`,
      async (params, respond) => {
        const body = await endpoints.fetch.self(params);

        await respond({
          body,
          status: body ? 200 : 404,
          headers: { 'Content-Type': 'application/vnd.api+json' },
        });
      },
    );

    if (endpoints.create?.self) {
      this.#endpointBuilder.addPost(
        definition,
        this.#schemaFactory.createEndpointsParamsSchema(),
        `/${type}`,
        async (body, params, respond) => {
          const data = await endpoints.create!.self!(
            this.#schemaFactory.createUpdateSchema(definition).parse(body),
            params,
          );

          await respond({
            body: data,
            status: 201,
            headers: { 'Content-Type': 'application/vnd.api+json' },
          });
        },
      );
    }

    if (endpoints.patch?.self) {
      this.#endpointBuilder.addPatch(
        definition,
        this.#schemaFactory.createEndpointsParamsSchema(),
        `/${type}/:id`,
        async (body, params, respond) => {
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
        },
      );
    }

    if (endpoints.delete?.self) {
      this.#endpointBuilder.addDelete(
        definition,
        this.#schemaFactory.createEndpointsParamsSchema(),
        `/${type}/:id`,
        async (params, respond) => {
         const data = await endpoints.delete!.self!(params);
          if (!data) {
            return await respond({ status: 404 });
          }

          await respond({
            body: data,
            status:  200,
            headers: { 'Content-Type': 'application/vnd.api+json' },
          });
        },
      );
    }

    const relationships = definition.relationships;

    for (const [key, oneOrMany] of Object.entries(relationships)) {
      const relationship = Array.isArray(oneOrMany) ? oneOrMany[0] : oneOrMany;

      this.#endpointBuilder.addGet(
        relationship,
        this.#schemaFactory.createEndpointsParamsSchema(),
        `/${type}/:id/relationships/${key}`,
        async (params, respond) => {
          const data = await endpoints.fetch?.related?.[key](params);
          // TODO: remove this, and all other 404s from relationships
          //TODO: with this removal the tests are getting status 200 so need to double ckeck
          if (!data) {
            return await respond({ status: 404 });
          }

          await respond({
            body: data,
            status: 200,
            headers: { 'Content-Type': 'application/vnd.api+json' },
          });
        },
      );

      this.#endpointBuilder.addPost(
        relationship,
        this.#schemaFactory.createEndpointsParamsSchema(),
        `/${type}/:id/relationships/${key}`,
        async (body, params, respond) => {
          //fixme: data is not denormalized
          const data = await endpoints.create?.related?.[key](
            body as any,
            params,
          ) as any;

          if (!data) {
            return await respond({ status: 404 });
          }

          await respond({
            body: this.#serializer.serialize(relationship, data, params),
            status: 200,
            headers: { 'Content-Type': 'application/vnd.api+json' },
          });
        },
      );

      this.#endpointBuilder.addPatch(
        relationship,
        this.#schemaFactory.createEndpointsParamsSchema(),
        `/${type}/:id/relationships/${key}`,
        async (body, params, respond) => {
          //fixme: data is not denormalized
          const data = await endpoints.patch?.related?.[key](
            body as any,
            params,
          ) as any;

          if (!data) {
            return await respond({ status: 404 });
          }

          await respond({
            body: this.#serializer.serialize(relationship, data, params),
            status: 200,
            headers: { 'Content-Type': 'application/vnd.api+json' },
          });
        },
      );

      // NOTE: this should be possible only if it is a one-to-many relationship
      this.#endpointBuilder.addDelete(
        relationship,
        this.#schemaFactory.createEndpointsParamsSchema(),
        `/${type}/:id/relationships/${key}`,
        async (params, respond) => {
          const data = await endpoints.delete?.related?.[key](params);
          if (!data) {
            return await respond({ status: 404 });
          }
          await respond({
            body: data,
            status: 200,
            headers: { 'Content-Type': 'application/vnd.api+json' },
          });
        },
      );
    }

    return this;
  }
}
