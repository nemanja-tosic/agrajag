import { ZodObject } from 'zod';

import { AttributesSchema, ResourceSchema } from './ResourceSchema.js';
import {
  ToManyLinkageSchema,
  ToOneLinkageSchema,
} from './ResourceLinkageSchema.js';

export type ResourceRelationships = Record<
  string,
  ResourceDefinition | [ResourceDefinition]
>;

export interface ResourceDefinition<
  TAttributes extends AttributesSchema = AttributesSchema,
  TRelationships extends ResourceRelationships = ResourceRelationships,
> {
  type: string;
  attributes: (string & keyof TAttributes['shape'])[];
  relationships: TRelationships;
  schema: ResourceSchema<
    TAttributes,
    ZodObject<{
      // TODO: based on relationship
      [K in keyof TRelationships]: ToOneLinkageSchema | ToManyLinkageSchema;
    }>
  >;
}
