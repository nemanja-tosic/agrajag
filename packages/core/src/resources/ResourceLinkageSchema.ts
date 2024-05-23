import { z, ZodArray, ZodLiteral, ZodObject, ZodString } from 'zod';

export type ResourceLinkage = z.infer<ResourceLinkageSchema>;

export type ResourceLinkageSchema = ToManyLinkageSchema | ToOneLinkageSchema;

export type ToOneLinkageSchema = ZodObject<{
  data: ResourceIdentifierSchema | ZodLiteral<null>;
}>;

export type ToManyLinkageSchema = ZodObject<{
  data: ZodArray<ResourceIdentifierSchema>;
}>;

export type ResourceIdentifier = {
  _flavor: 'ResourceIdentifier';
} & z.infer<ResourceIdentifierSchema>;

export type ResourceIdentifierSchema = ZodObject<{
  id: ZodString;
  type: ZodLiteral<string>;
}>;
