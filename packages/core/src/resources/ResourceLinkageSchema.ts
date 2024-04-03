import { z, ZodArray, ZodLiteral, ZodObject, ZodString } from 'zod';

export type ResourceLinkageSchema = ToManyLinkageSchema | ToOneLinkageSchema;

export type ToOneLinkageSchema = ZodObject<{
  data: ResourceIdentifierSchema;
}>;

export type ToManyLinkageSchema = ZodObject<{
  data: ZodArray<ResourceIdentifierSchema>;
}>;

export type ResourceIdentifierSchema = ZodObject<{
  id: ZodString;
  type: ZodLiteral<string>;
}>;

export type ResourceIdentifier = {
  _flavor: 'ResourceIdentifier';
} & z.infer<ResourceIdentifierSchema>;
