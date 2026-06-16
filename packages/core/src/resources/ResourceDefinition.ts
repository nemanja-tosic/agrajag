import { ZodLazy, ZodObject } from 'zod';

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
  FetchSelf = 1 << 0,
  FetchCollection = 1 << 1,
  Create = 1 << 2,
  Update = 1 << 3,
  Delete = 1 << 4,
}

export type AllCapabilitiesType =
  | ResourceCapabilities.FetchSelf
  | ResourceCapabilities.FetchCollection
  | ResourceCapabilities.Create
  | ResourceCapabilities.Update
  | ResourceCapabilities.Delete;

export const AllCapabilities: AllCapabilitiesType =
  ResourceCapabilities.FetchSelf |
  ResourceCapabilities.FetchCollection |
  ResourceCapabilities.Create |
  ResourceCapabilities.Update |
  ResourceCapabilities.Delete;

export type HasCapability<
  TCaps extends ResourceCapabilities,
  C extends ResourceCapabilities
> = C extends TCaps ? true : TCaps extends C ? true : false;

export interface ResourceDefinition<
  TType extends string = string,
  TAttributes extends AttributesSchema = AttributesSchema,
  TRelationships extends ResourceRelationships = ResourceRelationships,
  TCapabilities extends ResourceCapabilities = AllCapabilitiesType,
> {
  type: TType;
  attributes: (string & keyof TAttributes['shape'])[];
  relationships: TRelationships;
  capabilities: TCapabilities;
  schema: ResourceSchema<
    TType,
    TAttributes,
    ZodLazy<
      ZodObject<{
        // TODO: based on relationship
        [K in keyof TRelationships]: ToOneLinkageSchema | ToManyLinkageSchema;
      }>
    >
  >;
}
