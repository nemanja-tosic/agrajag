import {
  ArrayPrimaryType,
  SinglePrimaryType,
  UpdateSchema,
} from '../resources/ResourceSchema.js';
import { Params } from './Params.js';
import { z, ZodObject, ZodOptional, ZodString, ZodType } from 'zod';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { QueryParams } from './QueryParams.js';
import { ResourceIdentifier } from '../resources/ResourceLinkageSchema.js';
import { Resource } from '../resources/Resource.js';

export type Endpoints<TDefinition extends ResourceDefinition> = {
  fetch: FetchEndpoint<TDefinition>;
  create?: MutateEndpoint<TDefinition>;
  patch?: MutateEndpoint<TDefinition>;
  delete?: MutateEndpoint<TDefinition>;
};

type FetchEndpoint<TDefinition extends ResourceDefinition> = {
  //todo: return array of resources
  // collection: (params: QueryParams<TDefinition>) => Promise<Resource<TDefinition>[]>;
  collection: (params: QueryParams<TDefinition>) => Promise<Resource<TDefinition>>;
  self: (
    params: { id: string } & QueryParams,
  ) => Promise<Resource<TDefinition> | undefined>;
  related?: {
    [K in keyof TDefinition['relationships']]: (
      params: { id: string } & QueryParams,
    ) => Promise<ResourceIdentifier | ResourceIdentifier[]>;
  };
};

type MutateEndpoint<TDefinition extends ResourceDefinition> = {
  self?: (
    body: z.infer<UpdateSchema<TDefinition>>,
    params: Params,
  ) => Promise<Resource<TDefinition> | undefined>;
  related?: {
    [K in keyof TDefinition['relationships']]: (
      body: z.infer<SinglePrimaryType | ArrayPrimaryType>,
      params: { id: string },
    ) => Promise<any>;
  };
};

export type Normalized<TSchema extends ResourceDefinition> = {
  _flavor?: 'Normalized';
} & {
  id: z.infer<TSchema['schema']['shape']['id']>;
} & z.infer<TSchema['schema']['shape']['attributes']> & {
    // TODO: remap as keyId or keyIds
    [K in keyof TSchema['relationships']]: TSchema['relationships'][K] extends ResourceDefinition
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
      : {};
  };

export type EndpointSchema = ZodObject<{
  parameters: ZodObject<{
    path: ZodObject<{ id: ZodType<string> }>;
    query: ZodObject<{
      include: ZodOptional<ZodString>;
      fields: ZodOptional<ZodString>;
      sort: ZodOptional<ZodString>;
    }>;
  }>;
}>;
