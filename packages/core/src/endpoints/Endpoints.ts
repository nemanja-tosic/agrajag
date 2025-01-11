import {
  ArrayPrimaryType,
  SinglePrimaryType,
  UpdateSchema,
} from '../resources/ResourceSchema.js';
import { Params } from './Params.js';
import { z, ZodObject, ZodOptional, ZodRecord, ZodString } from 'zod';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { QueryParams } from './QueryParams.js';
import { ResourceLinkage } from '../resources/ResourceLinkageSchema.js';
import { Resource } from '../resources/Resource.js';

export type Endpoints<TDefinition extends ResourceDefinition> = {
  fetch?: FetchEndpoint<TDefinition>;
  create?: MutateEndpoint<TDefinition>;
  patch?: MutateEndpoint<TDefinition>;
  delete?: DeleteEndpoint<TDefinition>;
};

type FetchEndpoint<TDefinition extends ResourceDefinition> = {
  self?: (
    params: { id: string } & QueryParams,
  ) => Promise<Resource<TDefinition> | undefined>;
  collection?: (
    params: QueryParams<TDefinition>,
  ) => Promise<Resource<TDefinition>[] | undefined>;
  related?: RelatedEndpointsWithoutBody<TDefinition>;
};

type DeleteEndpoint<TDefinition extends ResourceDefinition> = {
  self: (
    params: { id: string } & QueryParams<TDefinition>,
  ) => Promise<Resource<TDefinition> | undefined>;
  related?: RelatedEndpointsWithoutBody<TDefinition>;
};

type MutateEndpoint<TDefinition extends ResourceDefinition> = {
  self?: (
    body: z.infer<UpdateSchema<TDefinition>>,
    params: Params,
  ) => Promise<Resource<TDefinition> | undefined>;
  related?: RelatedEndpointsWithBody<TDefinition>;
};

export type RelatedEndpointsWithoutBody<
  TDefinition extends ResourceDefinition,
> = {
  [K in keyof TDefinition['relationships']]: (
    params: { id: string } & QueryParams,
  ) => Promise<ResourceLinkage>;
};

export type RelatedEndpointsWithBody<TDefinition extends ResourceDefinition> = {
  [K in keyof TDefinition['relationships']]: (
    body: z.infer<SinglePrimaryType | ArrayPrimaryType>,
    params: { id: string },
  ) => Promise<ResourceLinkage>;
};

type Singularize<Key extends string> = Key extends `${infer Base}s`
  ? `${Base}`
  : Key;

type MapKeyToId<K, V> = K extends string
  ? `${Singularize<K>}${V extends any[] ? 'Ids' : 'Id'}`
  : never;

export type Stored<TSchema extends ResourceDefinition> =
  | Normalized<TSchema>
  | Denormalized<TSchema>;

export type Normalized<TSchema extends ResourceDefinition> = {
  _flavor?: 'Normalized';
} & {
  id: z.infer<TSchema['schema']['shape']['id']>;
} & z.infer<TSchema['schema']['shape']['attributes']> & {
    [K in keyof TSchema['relationships'] as MapKeyToId<
      K,
      TSchema['relationships'][K]
    >]: TSchema['relationships'][K] extends ResourceDefinition
      ? string
      : string[];
  };

export type Denormalized<TSchema extends ResourceDefinition> = {
  _flavor?: 'Denormalized';
} & {
  id: z.infer<TSchema['schema']['shape']['id']>;
} & z.infer<TSchema['schema']['shape']['attributes']> & {
    [K in keyof TSchema['relationships']]: TSchema['relationships'][K] extends ResourceDefinition
      ? { id: string } & z.infer<
          TSchema['relationships'][K]['schema']['shape']['attributes']
        >
      : TSchema['relationships'][K] extends ResourceDefinition[]
        ? ({ id: string } & z.infer<
            TSchema['relationships'][K][number]['schema']['shape']['attributes']
          >)[]
        : {};
  };

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
