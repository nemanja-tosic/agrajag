import { Params } from '../endpoints/Params.js';
import { EndpointSchema } from '../endpoints/Endpoints.js';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { ResourceLinkage } from '../resources/ResourceLinkageSchema.js';
import { Resource } from '../resources/Resource.js';

export interface Server {
  request(path: string, body: unknown): Response | Promise<Response>;
}

export abstract class ServerBuilder<TResult = unknown> {
  abstract addGet<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: FetchDeleteHandler<TPath, TDefinition>,
  ): void;

  abstract addPost<TPath extends string = string>(
    definition: ResourceDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void;

  abstract addPatch<TPath extends string = string>(
    definition: ResourceDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void;

  abstract addDelete<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: ResourceDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: FetchDeleteHandler<TPath, TDefinition>,
  ): void;

  abstract build(): TResult;
}

export type StatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500;

export interface Response {
  body?: Resource | Resource[] | ResourceLinkage | ResourceLinkage[];
  status: StatusCode;
  headers?: Record<string, string>;
}

export type RespondFunction = (response: Response) => Promise<void>;

export type MutationHandler<TPath extends string> = (
  body: unknown,
  params: Params<TPath>,
  respond: RespondFunction,
) => Promise<void>;

export type FetchDeleteHandler<
  TPath extends string,
  TDefinition extends ResourceDefinition = ResourceDefinition,
> = (
  params: Params<TPath, TDefinition>,
  respond: RespondFunction,
) => Promise<void>;
