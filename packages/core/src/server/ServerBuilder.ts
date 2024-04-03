import { Params } from '../endpoints/Params.js';
import { EndpointSchema } from '../endpoints/Endpoints.js';
import {
  ResourceDefinition,
} from '../resources/ResourceDefinition.js';
import { ResourceIdentifier } from '../resources/ResourceLinkageSchema.js';
import { Resource } from '../resources/Resource.js';

export abstract class ServerBuilder {
  abstract addGet<TPath extends string = string>(
    definition: ResourceDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: FetchHandler<TPath>,
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

  abstract addDelete<TPath extends string = string>(
    definition: ResourceDefinition,
    endpointSchema: EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void;
}

export type StatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500;

export interface Response {
  body?: Resource | Resource[] | ResourceIdentifier | ResourceIdentifier[];
  status: StatusCode;
  headers?: Record<string, string>;
}

export type RespondFunction = (response: Response) => Promise<void>;

export type MutationHandler<TPath extends string> = (
  body: unknown,
  params: Params<TPath>,
  respond: RespondFunction,
) => Promise<void>;

export type FetchHandler<TPath extends string> = (
  params: Params<TPath>,
  respond: RespondFunction,
) => Promise<void>;
