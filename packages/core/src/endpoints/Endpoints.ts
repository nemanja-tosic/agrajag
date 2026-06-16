import { UpdateSchema } from '../resources/ResourceSchema.js';
import { Params } from './Params.js';
import { z, ZodObject, ZodOptional, ZodRecord, ZodString, ZodType } from 'zod';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { QueryParams } from './QueryParams.js';
import { ResourceLinkage } from '../resources/ResourceLinkageSchema.js';
import { Document } from '../resources/Resource.js';

export type Endpoints<TDefinition extends ResourceDefinition> = {
  fetch?: FetchEndpoint<TDefinition>;
  create?: MutateEndpoint<TDefinition>;
  patch?: MutateEndpoint<TDefinition>;
  delete?: DeleteEndpoint<TDefinition>;
};

type FetchEndpoint<TDefinition extends ResourceDefinition> = {
  self?: (
    params: { id: string } & QueryParams<TDefinition>,
  ) => Promise<Document<TDefinition> | undefined>;
  collection?: (
    params: QueryParams<TDefinition>,
  ) => Promise<Document<TDefinition>[] | undefined>;
  related?: RelatedEndpointsWithoutBody<TDefinition>;
};

type DeleteEndpoint<TDefinition extends ResourceDefinition> = {
  self: (
    params: { id: string } & QueryParams<TDefinition>,
  ) => Promise<Document<TDefinition> | undefined>;
  related?: RelatedEndpointsWithBody<TDefinition>;
};

// Body output, mapped directly (UpdateSchema is a composed generic ZodObject, so
// z.infer<UpdateSchema<T>> hits the same #4619 collapse). attributes are all
// optional on update; relationship linkages stay structural for the POC.
type LinkageValue =
  | { data: { id: string; type: string } | null }
  | { data: { id: string; type: string }[] };
export type MutateEndpointBody<TDefinition extends ResourceDefinition> = {
  data: {
    id?: string;
    type: Out<TDefinition['schema']['shape']['type']>;
    attributes: Partial<
      InferShape<TDefinition['schema']['shape']['attributes']['shape']>
    >;
    relationships?: Record<string, LinkageValue>;
  };
};

type MutateEndpoint<TDefinition extends ResourceDefinition> = {
  self?: (
    body: MutateEndpointBody<TDefinition>,
    params: Params<string, TDefinition>,
  ) => Promise<Document<TDefinition> | undefined>;
  related?: RelatedEndpointsWithBody<TDefinition>;
};

export type RelatedEndpointsWithoutBody<
  TDefinition extends ResourceDefinition,
> = {
  [K in keyof TDefinition['relationships']]: (
    params: { id: string } & QueryParams<TDefinition>,
  ) => Promise<ResourceLinkage>;
};

export type RelatedEndpointsWithBody<TDefinition extends ResourceDefinition> = {
  [K in keyof TDefinition['relationships']]: (
    body: ResourceLinkage,
    params: { id: string } & QueryParams<TDefinition>,
  ) => Promise<Stored<TDefinition>>;
};

// --- zod 4 inference rewrite (POC) -----------------------------------------
// zod 4 can't infer the OUTPUT of an object whose properties are generic
// schemas (colinhacks/zod#4619, wontfix). agrajag derived attribute output via
// `z.infer<ZodObject<{ id } & attrsShape>>` — exactly that broken pattern, so
// under v4 it collapsed to `{}`. Instead, map the shape per LEAF: `z.infer` of a
// single schema (`Out`) still resolves generically; only object-composition
// inference is broken. `InferShape` reproduces zod's object output (optional
// schemas → optional keys) without ever composing a generic object.
type IsOptionalSchema<T> = T extends ZodOptional<ZodType> ? true : false;
type Out<T> = T extends ZodType ? z.infer<T> : never;
// `string extends keyof S` is true only for the WIDE default shape (ZodRawShape's
// string index signature, i.e. an unparameterised ResourceDefinition). There we
// yield a permissive supertype so specific `…<TDefinition>` stays assignable to
// the wide `…<ResourceDefinition>` the adapters use as a parameter type. For a
// concrete shape we map per-leaf with precise optional keys.
type InferShape<S> = string extends keyof S
  ? Record<string, unknown>
  : {
      [K in keyof S as IsOptionalSchema<S[K]> extends true ? never : K]: Out<S[K]>;
    } & {
      [K in keyof S as IsOptionalSchema<S[K]> extends true ? K : never]?: Out<S[K]>;
    };
// id + attributes output, mapped directly off the definition's shape. `id` is
// hoisted out of the mapped type (always a ZodString → string): a conditional
// key-remap defers under a fully-generic TDefinition, so leaving id inside made
// `Stored<TDefinition>['id']` appear absent in adapter generic contexts.
type IdPlusAttributesOutput<TSchema extends ResourceDefinition> = {
  id: string;
} & InferShape<TSchema['schema']['shape']['attributes']['shape']>;

export type Stored<TSchema extends ResourceDefinition> = Flavor<
  IdPlusAttributesOutput<TSchema> & {
    [K in keyof TSchema['relationships']]: TSchema['relationships'][K] extends ResourceDefinition
      ?
          | {
              id: z.infer<TSchema['relationships'][K]['schema']['shape']['id']>;
            }
          | Stored<TSchema['relationships'][K]>
      : TSchema['relationships'][K] extends ResourceDefinition[]
        ?
            | {
                id: z.infer<
                  TSchema['relationships'][K][number]['schema']['shape']['id']
                >[];
              }
            | Stored<TSchema['relationships'][K][number]>[]
        : {};
  },
  'Denormalized'
>;

type Flavor<T, F> = T & { _flavor?: F };

// TODO: This should be renamed to something like Normalized, meaning standardized
export type Denormalized<TSchema extends ResourceDefinition> = Flavor<
  IdPlusAttributesOutput<TSchema> & {
    [K in keyof TSchema['relationships']]?: TSchema['relationships'][K] extends ResourceDefinition
      ? Denormalized<TSchema['relationships'][K]>
      : TSchema['relationships'][K] extends ResourceDefinition[]
        ? Denormalized<TSchema['relationships'][K][number]>[]
        : {};
  },
  'Denormalized'
>;

export type IdPlusAttributes<
  TSchema extends ResourceDefinition,
  TShape extends TSchema['schema']['shape'] = TSchema['schema']['shape'],
> = ZodObject<{ id: TShape['id'] } & TShape['attributes']['shape']>;

export type EndpointSchema = ZodObject<{
  request?: ZodRecord;
  response?: ZodRecord;
  parameters: ZodObject<{
    path?: ZodObject<{}>;
    query: ZodObject<{
      include: ZodOptional<ZodString>;
      // TODO: define the fields based on latest changes
      // fields: ZodOptional<ZodString>;
      sort: ZodOptional<ZodString>;
      filter: ZodOptional<ZodString>;
    }>;
  }>;
}>;
