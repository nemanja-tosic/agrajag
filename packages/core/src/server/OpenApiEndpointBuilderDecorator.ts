import {
  createDocument,
  ZodOpenApiPathItemObject,
  ZodOpenApiPathsObject,
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

  #paths: Record<string, (() => ZodOpenApiPathItemObject)[] | undefined> = {};

  constructor(builder: ServerBuilder) {
    super();

    this.builder = builder;
  }

  addGet<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: FetchDeleteHandler<TPath, TDefinition>,
  ) {
    this.#addPath(path, () => {
      const endpointSchema = createEndpointSchema();

      return {
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
      };
    });

    this.builder.addGet(definition, createEndpointSchema, path, handler);
  }

  addPost<TPath extends string = string>(
    definition: ResourceDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {
    this.#addPath(path, () => {
      const endpointSchema = createEndpointSchema();

      return {
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
      };
    });

    this.builder.addPost(definition, createEndpointSchema, path, handler);
  }

  addPatch<TPath extends string = string>(
    definition: ResourceDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {
    this.#addPath(path, () => {
      const endpointSchema = createEndpointSchema();

      return {
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
      };
    });

    this.builder.addPatch(definition, createEndpointSchema, path, handler);
  }

  addDelete<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {
    this.#addPath(path, () => {
      const endpointSchema = createEndpointSchema();

      return {
        delete: {
          requestParams: {
            path: endpointSchema.shape.parameters.shape.path,
            query: endpointSchema.shape.parameters.shape.query,
          },
          ...(endpointSchema.shape.request && {
            requestBody: {
              content: {
                'application/json': { schema: endpointSchema.shape.request },
              },
            },
          }),
          responses: {
            200: {
              content: {
                'application/json': { schema: endpointSchema.shape.response },
              },
            },
          },
        },
      };
    });

    this.builder.addDelete(definition, createEndpointSchema, path, handler);
  }

  #addPath(path: string, item: () => ZodOpenApiPathItemObject): void {
    const oapiPath = path.replace(/:(\w+)/g, '{$1}');

    this.#paths[oapiPath] = (this.#paths[oapiPath] ?? []).concat(item);
  }

  build(): any {
    const paths = Object.entries(this.#paths).reduce(
      (acc, [path, items = []]) => ({
        ...acc,
        [path]: items.reduce(
          (acc, item) => ({ ...acc, ...item() }),
          {} as ZodOpenApiPathItemObject,
        ),
      }),
      {} as ZodOpenApiPathsObject,
    );

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
      paths,
    });
  }
}
