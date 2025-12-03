import { Params } from '../endpoints/Params.js';
import { EndpointSchema } from '../endpoints/Endpoints.js';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { ResourceLinkage } from '../resources/ResourceLinkageSchema.js';
import { Resource } from '../resources/Resource.js';
import { ErrorObject } from '../resources/Error.js';

export abstract class ServerBuilder {
  abstract addGet<TPath extends string, TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: FetchDeleteHandler<TPath, TDefinition>,
  ): void;

  abstract addPost<
    TPath extends string,
    TDefinition extends ResourceDefinition,
  >(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
  ): void;

  abstract addPatch<
    TPath extends string,
    TDefinition extends ResourceDefinition,
  >(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
  ): void;

  abstract addDelete<
    TPath extends string,
    TDefinition extends ResourceDefinition,
  >(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
  ): void;
}

export type StatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500;

// FIXME: the response contains a top level object (data, errors or meta).
//  Things work right now, but the types are incorrect.
export interface Response {
  body?:
    | Resource
    | Resource[]
    | ResourceLinkage
    | ResourceLinkage[]
    | ErrorObject;
  status: StatusCode;
  headers?: Record<string, string>;
}

export type RespondFunction = (response: Response) => Promise<void>;

export type MutationHandler<
  TPath extends string,
  TDefinition extends ResourceDefinition,
> = (
  body: unknown,
  params: Params<TPath, TDefinition>,
  respond: RespondFunction,
) => Promise<void>;

export type FetchDeleteHandler<
  TPath extends string,
  TDefinition extends ResourceDefinition = ResourceDefinition,
> = (
  params: Params<TPath, TDefinition>,
  respond: RespondFunction,
) => Promise<void>;
