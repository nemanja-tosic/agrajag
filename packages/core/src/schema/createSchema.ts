import { AttributesSchema } from '../resources/ResourceSchema.js';
import { CreateSchemaOptions } from './SchemaFactory.js';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { DeferredRelationships, UndeferredRelationships } from '../Builder.js';
import { ZodSchemaFactory } from './ZodSchemaFactory.js';

export function createSchema<
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
  return new ZodSchemaFactory().createSchema(type, attributesSchema, options);
}
