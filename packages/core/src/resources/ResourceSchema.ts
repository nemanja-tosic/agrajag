import {
  output,
  ZodArray,
  ZodLazy,
  ZodLiteral,
  ZodNull,
  ZodObject,
  ZodOptional,
  ZodRawShape,
  ZodString,
} from 'zod';
import { ResourceDefinition } from './ResourceDefinition.js';
import { ResourceLinkageSchema } from './ResourceLinkageSchema.js';

export type ResourceSchema<
  TType extends string = string,
  TAttrs extends AttributesSchema = AttributesSchema,
  TRels extends RelationshipsSchema = RelationshipsSchema,
> = ZodObject<{
  id: ZodString;
  type: ZodLiteral<TType>;
  attributes: TAttrs;
  relationships: TRels;
}>;

export type AttributesSchema<T extends ZodRawShape = ZodRawShape> =
  ZodObject<T>;

export type RelationshipsSchema<
  TLinkage extends ResourceLinkageSchema = ResourceLinkageSchema,
> = ZodLazy<
  ZodObject<{
    [key: string]: TLinkage;
  }>
>;

export type UpdateSchema<TDefinition extends ResourceDefinition> = ZodObject<{
  data: ZodObject<{
    id: TDefinition['schema']['shape']['id'];
    type: TDefinition['schema']['shape']['type'];
    attributes: ZodOptional<TDefinition['schema']['shape']['attributes']>;
    relationships: ZodOptional<
      ZodObject<{
        [K in keyof TDefinition['schema']['shape']['relationships']['schema']['shape']]: ZodOptional<
          ZodObject<{
            data: ZodObject<{ id: ZodString; type: ZodString }> | ZodNull;
          }>
        >;
      }>
    >;
  }>;
}>;

export type SinglePrimaryType<
  TSchema extends ResourceDefinition = ResourceDefinition,
> = ZodObject<{
  data: TSchema['schema'];
}>;

export type ArrayPrimaryType<
  TSchema extends ResourceDefinition = ResourceDefinition,
> = ZodObject<{
  data: ZodArray<TSchema['schema']>;
}>;
