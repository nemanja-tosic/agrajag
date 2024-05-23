import { createDocument, ZodOpenApiPathsObject } from 'zod-openapi';
import { EndpointSchema } from '../endpoints/Endpoints.js';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import {
  ServerBuilder,
  FetchDeleteHandler,
  MutationHandler,
} from './ServerBuilder.js';

export class OpenApiEndpointBuilderDecorator extends ServerBuilder {
  private builder: ServerBuilder;

  #paths: ZodOpenApiPathsObject = {};

  constructor(builder: ServerBuilder) {
    super();

    this.builder = builder;
  }

  addGet<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: FetchDeleteHandler<TPath, TDefinition>,
  ) {
    this.#paths[path] = {
      ...this.#paths[path],
      get: {
        requestParams: {
          path: endpointSchema.shape.parameters.shape.path,
          query: endpointSchema.shape.parameters.shape.query,
        },
        responses: {
          200: {
            content: { 'application/json': { schema: definition.schema } },
          },
        },
      },
    };

    this.builder.addGet(definition, endpointSchema, path, handler);
  }

  addPost<TPath extends string = string>(
    definition: ResourceDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {
    this.#paths[path] = {
      ...this.#paths[path],
      post: {
        requestParams: {
          path: endpointSchema.shape.parameters.shape.path,
          query: endpointSchema.shape.parameters.shape.query,
        },
        requestBody: {
          content: { 'application/json': { schema: definition.schema } },
        },
        responses: {
          200: {
            content: { 'application/json': { schema: definition.schema } },
          },
        },
      },
    };

    this.builder.addPost(definition, endpointSchema, path, handler);
  }

  addPatch<TPath extends string = string>(
    definition: ResourceDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {
    this.#paths[path] = {
      ...this.#paths[path],
      patch: {
        requestParams: {
          path: endpointSchema.shape.parameters.shape.path,
          query: endpointSchema.shape.parameters.shape.query,
        },
        requestBody: {
          content: { 'application/json': { schema: definition.relationships } },
        },
        responses: {
          200: {
            content: { 'application/json': { schema: definition.schema } },
          },
        },
      },
    };

    this.builder.addPatch(definition, endpointSchema, path, handler);
  }

  addDelete<TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition>(
    definition: TDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: FetchDeleteHandler<TPath, TDefinition>,
  ): void {
    this.#paths[path] = {
      ...this.#paths[path],
      delete: {
        requestParams: {
          path: endpointSchema.shape.parameters.shape.path,
          query: endpointSchema.shape.parameters.shape.query,
        },
        responses: {
          200: {
            content: { 'application/json': { schema: definition.schema } },
          },
        },
      },
    };

    this.builder.addDelete(definition, endpointSchema, path, handler);
  }

  build(): any {
    return createDocument({
      openapi: '3.1.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3100',
        },
      ],
      paths: this.#paths,
    });
  }
}
