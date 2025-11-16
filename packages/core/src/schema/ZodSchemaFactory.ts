import {
  ArrayPrimaryType,
  AttributesSchema,
  SinglePrimaryType,
  UpdateSchema,
} from '../resources/ResourceSchema.js';
import {
  AllCapabilities,
  ResourceDefinition,
} from '../resources/ResourceDefinition.js';
import { z, ZodType, ZodTypeAny } from 'zod';
import { CreateSchemaOptions, SchemaFactory } from './SchemaFactory.js';
import { EndpointSchema } from '../endpoints/Endpoints.js';
import { extendZodWithOpenApi } from 'zod-openapi';
import {
  ToManyLinkageSchema,
  ToOneLinkageSchema,
} from '../resources/ResourceLinkageSchema.js';
import { DeferredRelationships, UndeferredRelationships } from '../Builder.js';

export class ZodSchemaFactory implements SchemaFactory {
  static {
    extendZodWithOpenApi(z);
  }

  createSchema<
    TType extends string = string,
    TAttributes extends AttributesSchema = AttributesSchema,
    TRelationships extends DeferredRelationships = DeferredRelationships,
  >(
    type: TType,
    attributesSchema: TAttributes,
    options?: CreateSchemaOptions<TRelationships>,
  ): ResourceDefinition<
    TType,
    TAttributes,
    UndeferredRelationships<TRelationships>
  > {
    const relationships = options?.relationships as
      | Record<string, () => ResourceDefinition | [ResourceDefinition]>
      | undefined;

    return {
      type,
      schema: z.object({
        id: z.string(),
        type: z.literal(type),
        attributes: attributesSchema,
        relationships: this.#createRelationshipsSchema(relationships ?? {}),
      }) as any,
      capabilities: options?.capabilities ?? AllCapabilities,
      attributes: Object.keys(attributesSchema.shape),
      get relationships() {
        if (!relationships) {
          return {} as UndeferredRelationships<TRelationships>;
        }

        return Object.fromEntries(
          Object.entries(relationships).map(([key, thunk]) => [key, thunk()]),
        ) as UndeferredRelationships<TRelationships>;
      },
    };
  }

  #createRelationshipsSchema(
    relationships: Record<
      string,
      () => ResourceDefinition | [ResourceDefinition]
    >,
  ) {
    return z.lazy(() =>
      z.object(
        Object.fromEntries(
          Object.entries(relationships).map(([key, thunk]) => {
            const value = thunk();

            return [
              key,
              Array.isArray(value)
                ? z.object({
                    data: z.array(
                      z.object({
                        id: z.string(),
                        type: z.literal(value[0].type),
                      }),
                    ),
                  })
                : z.object({
                    data: z.object({
                      id: z.string(),
                      type: z.literal(value.type),
                    }),
                  }),
            ];
          }),
        ),
      ),
    );
  }

  createEndpointSchema<
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
    options?: { requestSchema?: any; responseSchema?: any; noId?: boolean },
  ): EndpointSchema {
    // TODO: replace string so that we validate the fields we get
    const querySchema = z.object({
      [`fields[${definition.type}]`]: z.string().optional(),
      ...Object.fromEntries(
        Object.entries(definition.schema.shape.relationships.schema.shape).map(
          ([key]) => [`fields[${key}]`, z.string().optional()],
        ),
      ),
    });

    return z.object({
      ...(options?.requestSchema ? { request: options.requestSchema } : {}),
      ...(options?.responseSchema ? { response: options.responseSchema } : {}),
      parameters: z.object({
        path: z.object({
          ...(options?.noId
            ? {}
            : {
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
              }),
        }),
        query: z.object({
          include: z
            .string()
            .optional()
            .openapi({ param: { name: 'include', in: 'query' } }),
          ...querySchema.shape,
          sort: z
            .string()
            .optional()
            .openapi({ param: { name: 'sort', in: 'query' } }),
          filter: z.string().optional(),
        }),
      }),
    });
  }

  createSinglePrimaryTypeSchema<
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
    options?: {
      optionalId?: boolean;
      partialAttributes?: boolean;
      withDenormalize?: boolean;
    },
  ): SinglePrimaryType<TDefinition> {
    let attributes = definition.schema.shape.attributes;
    if (options?.partialAttributes) {
      attributes = attributes.deepPartial();
    }

    const id = options?.optionalId ? z.string().optional() : z.string();

    return z.object({
      data: z.object({
        id,
        type: definition.schema.shape.type,
        attributes,
        relationships: z
          .lazy(() => definition.schema.shape.relationships.schema.partial())
          .optional(),
      }),
      ...(options?.withDenormalize
        ? {
            'x-denormalized': createDenormalized(
              definition,
              this.#components,
            ).optional(),
          }
        : {}),
    }) as any;
  }

  createArrayPrimaryTypeSchema<
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
    options?: { withDenormalize?: boolean },
  ): ArrayPrimaryType<TDefinition> {
    return z.object({
      data: z.array(
        z.object({
          id: z.string().optional(),
          type: definition.schema.shape.type,
          attributes: definition.schema.shape.attributes,
          relationships: z
            .lazy(() => definition.schema.shape.relationships.schema.partial())
            .optional(),
        }),
      ),
      ...(options?.withDenormalize
        ? {
            'x-denormalized': z
              .array(createDenormalized(definition, this.#components))
              .optional(),
          }
        : {}),
    }) as any;
  }

  #components: Map<ResourceDefinition, ZodType> = new Map();

  createResourceMultiLinkageSchema(
    definition: ResourceDefinition,
  ): ToManyLinkageSchema {
    return z.object({
      data: z.array(
        z.object({ id: z.string(), type: definition.schema.shape.type }),
      ),
    });
  }

  createResourceSingleLinkageSchema(
    definition: ResourceDefinition,
  ): ToOneLinkageSchema {
    return z.object({
      data: z.object({ id: z.string(), type: definition.schema.shape.type }),
    });
  }

  createUpdateSchema<
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(definition: TDefinition): UpdateSchema<TDefinition> {
    return z.object({
      data: z.object({
        id: definition.schema.shape.id.optional(),
        type: definition.schema.shape.type,
        attributes: definition.schema.shape.attributes.deepPartial().optional(),
        relationships: z
          .object(
            Object.fromEntries(
              Object.keys(
                definition.schema.shape.relationships.schema.shape,
              ).map(key => [
                key,
                // FIXME
                z.any().nullish(),
                // z.object({
                //   data: z
                //     .object({ id: z.string(), type: z.string() })
                //     .nullable(),
                // }),
              ]),
            ),
          )
          .partial()
          .optional(),
      }),
    }) as any;
  }
}

export function createDenormalized<TSchema extends ResourceDefinition>(
  schema: TSchema,
  visited: Map<ResourceDefinition, ZodTypeAny>,
): ZodTypeAny {
  const cached = visited.get(schema);
  if (cached) {
    return cached;
  }

  const type = z
    .lazy(() =>
      z.object({
        id: schema.schema.shape.id,
        ...schema.schema.shape.attributes.shape,
        ...Object.fromEntries(
          Object.entries(schema.relationships).map(([key, value]) =>
            Array.isArray(value)
              ? [key, z.array(createDenormalized(value[0], visited))]
              : [key, createDenormalized(value, visited)],
          ),
        ),
      }),
    )
    .openapi({ ref: schema.type });

  visited.set(schema, type);

  return type;
}
