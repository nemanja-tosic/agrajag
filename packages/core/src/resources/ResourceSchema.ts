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
  ZodType,
  ZodTypeAny,
} from 'zod';
import { ResourceDefinition } from './ResourceDefinition.js';
import {
  ResourceLinkageSchema,
  ToManyLinkageSchema,
  ToOneLinkageSchema,
} from './ResourceLinkageSchema.js';

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

type GetAttributesShape<TDefinition extends ResourceDefinition> =
  TDefinition extends ResourceDefinition<any, infer TAttrs, any>
    ? TAttrs extends AttributesSchema<infer TShape>
      ? TShape
      : never
    : never;

// zod 4 removed ZodLazy['schema'], so the old walk
// (...['relationships']['schema']['shape']) no longer resolves. The relationship
// NAMES are all UpdateSchema needs (values are replaced by ToOne|ToMany below),
// so derive the shape from the definition's relationships record instead.
type GetRelationshipsShape<TDefinition extends ResourceDefinition> = {
  [K in keyof TDefinition['relationships']]: ToOneLinkageSchema | ToManyLinkageSchema;
};

export type UpdateSchema<
  TDefinition extends ResourceDefinition,
  TAttributes extends ZodRawShape = GetAttributesShape<TDefinition>,
  TRelationships extends ZodRawShape = GetRelationshipsShape<TDefinition>,
> = ZodObject<{
  data: ZodObject<{
    id: ZodOptional<TDefinition['schema']['shape']['id']>;
    type: TDefinition['schema']['shape']['type'];
    attributes: ZodObject<{
      [K in keyof TAttributes]: ZodOptional<TAttributes[K]>;
    }>;
    relationships: ZodOptional<
      ZodObject<{
        [K in keyof TRelationships]: ZodOptional<
          // TODO: based on definition
          ToOneLinkageSchema | ToManyLinkageSchema
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
