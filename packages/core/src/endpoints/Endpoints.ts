import { UpdateSchema } from '../resources/ResourceSchema.js';
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
  related?: RelatedEndpointsWithBody<TDefinition>;
};

export type MutateEndpointBody<TDefinition extends ResourceDefinition> =
  z.infer<UpdateSchema<TDefinition>>;

type MutateEndpoint<TDefinition extends ResourceDefinition> = {
  self?: (
    body: z.infer<UpdateSchema<TDefinition>>,
    params: Params<string, TDefinition>,
  ) => Promise<Resource<TDefinition> | undefined>;
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

export type Stored<TSchema extends ResourceDefinition> = Flavor<
  z.infer<IdPlusAttributes<TSchema>> & {
    [K in keyof TSchema['relationships']]: TSchema['relationships'][K] extends ResourceDefinition
      ?
          | z.infer<TSchema['relationships'][K]['schema']['shape']['id']>
          | Stored<TSchema['relationships'][K]>
      : TSchema['relationships'][K] extends ResourceDefinition[]
        ?
            | z.infer<
                TSchema['relationships'][K][number]['schema']['shape']['id']
              >[]
            | Stored<TSchema['relationships'][K][number]>[]
        : {};
  },
  'Normalized' | 'Denormalized'
>;

type Flavor<T, F> = T & { _flavor?: F };

export type Normalized<TSchema extends ResourceDefinition> = Flavor<
  z.infer<IdPlusAttributes<TSchema>> & {
    [K in keyof TSchema['relationships']]: TSchema['relationships'][K] extends ResourceDefinition
      ? z.infer<TSchema['relationships'][K]['schema']['shape']['id']>
      : TSchema['relationships'][K] extends ResourceDefinition[]
        ? z.infer<
            TSchema['relationships'][K][number]['schema']['shape']['id']
          >[]
        : {};
  },
  'Normalized'
>;

export type Denormalized<TSchema extends ResourceDefinition> = Flavor<
  z.infer<IdPlusAttributes<TSchema>> & {
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
