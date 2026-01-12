import { AttributesSchema } from '../resources/ResourceSchema.js';
import { CreateSchemaOptions } from './SchemaFactory.js';
import {
  AllCapabilitiesType,
  ResourceCapabilities,
  ResourceDefinition,
} from '../resources/ResourceDefinition.js';
import { DeferredRelationships, UndeferredRelationships } from '../Builder.js';
import { ZodSchemaFactory } from './ZodSchemaFactory.js';

export function createSchema<
  TType extends string = string,
  TAttributes extends AttributesSchema = AttributesSchema,
  TRelationships extends DeferredRelationships = DeferredRelationships,
  TCapabilities extends ResourceCapabilities = AllCapabilitiesType,
>(
  type: TType,
  attributesSchema: TAttributes,
  options?: CreateSchemaOptions<TRelationships, TCapabilities>,
): ResourceDefinition<
  TType,
  TAttributes,
  UndeferredRelationships<TRelationships>,
  TCapabilities
> {
  return new ZodSchemaFactory().createSchema(type, attributesSchema, options);
}
