import {
  createDocument,
  ZodOpenApiPathsObject,
  ZodOpenApiPathItemObject,
} from 'zod-openapi';
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
    this.#addPath(path, {
      get: {
        requestParams: {
          path: endpointSchema.shape.parameters.shape.path,
          query: endpointSchema.shape.parameters.shape.query,
        },
        responses: {
          200: {
            content: {
              'application/json': { schema: endpointSchema.shape.response },
            },
          },
        },
      },
    });

    this.builder.addGet(definition, endpointSchema, path, handler);
  }

  addPost<TPath extends string = string>(
    definition: ResourceDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {
    this.#addPath(path, {
      post: {
        requestParams: {
          path: endpointSchema.shape.parameters.shape.path,
          query: endpointSchema.shape.parameters.shape.query,
        },
        requestBody: {
          content: {
            'application/json': { schema: endpointSchema.shape.request },
          },
        },
        responses: {
          200: {
            content: {
              'application/json': { schema: endpointSchema.shape.response },
            },
          },
        },
      },
    });

    this.builder.addPost(definition, endpointSchema, path, handler);
  }

  addPatch<TPath extends string = string>(
    definition: ResourceDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {
    this.#addPath(path, {
      patch: {
        requestParams: {
          path: endpointSchema.shape.parameters.shape.path,
          query: endpointSchema.shape.parameters.shape.query,
        },
        requestBody: {
          content: {
            'application/json': { schema: endpointSchema.shape.request },
          },
        },
        responses: {
          200: {
            content: {
              'application/json': { schema: endpointSchema.shape.response },
            },
          },
        },
      },
    });

    this.builder.addPatch(definition, endpointSchema, path, handler);
  }

  addDelete<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: FetchDeleteHandler<TPath, TDefinition>,
  ): void {
    this.#addPath(path, {
      delete: {
        requestParams: {
          path: endpointSchema.shape.parameters.shape.path,
          query: endpointSchema.shape.parameters.shape.query,
        },
        responses: {
          200: {
            content: {
              'application/json': { schema: endpointSchema.shape.response },
            },
          },
        },
      },
    });

    this.builder.addDelete(definition, endpointSchema, path, handler);
  }

  #addPath(path: string, item: ZodOpenApiPathItemObject): void {
    const oapiPath = path.replace(/:(\w+)/g, '{$1}');

    this.#paths[oapiPath] = { ...this.#paths[oapiPath], ...item };
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
