import {
  AttributesSchema,
  SinglePrimaryType,
  UpdateSchema,
} from '../resources/ResourceSchema.js';
import {
  ResourceDefinition,
  ResourceRelationships,
} from '../resources/ResourceDefinition.js';
import { z } from 'zod';
import { SchemaFactory } from './SchemaFactory.js';
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
    options?: { relationships?: TRelationships },
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
      attributes: Object.keys(attributesSchema.shape),
      relationships: options?.relationships ?? ({} as TRelationships),
    };
  }

  createEndpointsParamsSchema(): EndpointSchema {
    return z.object({
      parameters: z.object({
        path: z.object({
          id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
        }),
        query: z.object({
          include: z
            .string()
            .optional()
            .openapi({ param: { name: 'include', in: 'query' } }),
          fields: z
            .string()
            .optional()
            .openapi({ param: { name: 'fields', in: 'query' } }),
          // TODO: limit to fields in definition
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
  >(definition: TDefinition): SinglePrimaryType<TDefinition> {
    return z.object({
      data: z.object({
        id: z.string().optional(),
        type: definition.schema.shape.type,
        attributes: definition.schema.shape.attributes,
        relationships: definition.schema.shape.relationships,
      }),
    }) as any;
  }

  createUpdateSchema<
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(definition: TDefinition): UpdateSchema<TDefinition> {
    return z.object({
      data: z.object({
        id: definition.schema.shape.id,
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
