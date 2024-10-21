import {
  ArrayPrimaryType,
  AttributesSchema,
  SinglePrimaryType,
  UpdateSchema,
} from '../resources/ResourceSchema.js';
import {
  AllCapabilities,
  ResourceDefinition,
  ResourceRelationships,
} from '../resources/ResourceDefinition.js';
import { z } from 'zod';
import { CreateSchemaOptions, SchemaFactory } from './SchemaFactory.js';
import { EndpointSchema } from '../endpoints/Endpoints.js';
import { extendZodWithOpenApi } from 'zod-openapi';

export class ZodSchemaFactory implements SchemaFactory {
  static {
    extendZodWithOpenApi(z);
  }

  createSchema<
    TAttributes extends AttributesSchema = AttributesSchema,
    TRelationships extends ResourceRelationships = ResourceRelationships,
  >(
    type: string,
    createAttributesSchema: (zod: typeof z) => TAttributes,
    options?: CreateSchemaOptions<TRelationships>,
  ): ResourceDefinition<TAttributes, TRelationships> {
    const attributesSchema = createAttributesSchema(z);

    return {
      type,
      schema: z.object({
        id: z.string(),
        type: z.literal(type),
        attributes: attributesSchema,
        relationships: z.object(
          Object.fromEntries(
            Object.entries(options?.relationships ?? {}).map(([key, value]) => {
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
      }) as any,
      capabilities: options?.capabilities ?? AllCapabilities,
      attributes: Object.keys(attributesSchema.shape),
      relationships: options?.relationships ?? ({} as TRelationships),
    };
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
        Object.entries(definition.schema.shape.relationships.shape).map(
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
        }),
      }),
    });
  }

  createSinglePrimaryTypeSchema<
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
    options?: { optionalId?: boolean; partialAttributes?: boolean },
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
        relationships: definition.schema.shape.relationships,
      }),
    }) as any;
  }

  createArrayPrimaryTypeSchema<
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(definition: TDefinition): ArrayPrimaryType<TDefinition> {
    return z.object({
      data: z.array(
        z.object({
          id: z.string().optional(),
          type: definition.schema.shape.type,
          attributes: definition.schema.shape.attributes,
          relationships: definition.schema.shape.relationships,
        }),
      ),
    }) as any;
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
              Object.keys(definition.schema.shape.relationships.shape).map(
                key => [
                  key,
                  // FIXME
                  z.any(),
                  // z.object({
                  //   data: z
                  //     .object({ id: z.string(), type: z.string() })
                  //     .nullable(),
                  // }),
                ],
              ),
            ),
          )
          .optional(),
      }),
    }) as any;
  }
}
