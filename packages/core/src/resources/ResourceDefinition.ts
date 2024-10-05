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

export enum ResourceCapabilities {
  None = 0,
  FetchSelf = 1 << 0,
  FetchCollection = 1 << 1,
  Create = 1 << 2,
  Update = 1 << 3,
  Delete = 1 << 4,
}

export const AllCapabilities: ResourceCapabilities =
  ResourceCapabilities.FetchSelf |
  ResourceCapabilities.FetchCollection |
  ResourceCapabilities.Create |
  ResourceCapabilities.Update |
  ResourceCapabilities.Delete;

export interface ResourceDefinition<
  TAttributes extends AttributesSchema = AttributesSchema,
  TRelationships extends ResourceRelationships = ResourceRelationships,
> {
  type: string;
  attributes: (string & keyof TAttributes['shape'])[];
  relationships: TRelationships;
  capabilities: ResourceCapabilities;
  schema: ResourceSchema<
    TAttributes,
    ZodObject<{
      // TODO: based on relationship
      [K in keyof TRelationships]: ToOneLinkageSchema | ToManyLinkageSchema;
    }>
  >;
}
