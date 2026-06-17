import { Params } from '../endpoints/Params.js';
import { EndpointSchema } from '../endpoints/Endpoints.js';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { ResourceLinkage } from '../resources/ResourceLinkageSchema.js';
import { Resource } from '../resources/Resource.js';
import { ErrorObject } from '../resources/Error.js';

/**
 * Which logical endpoint an `add*` call represents, passed so adapters don't have
 * to reverse-engineer it from the path string. The HTTP verb (which `add*` method)
 * plus this fully identifies the operation; for relationship endpoints it also
 * carries the relationship key and cardinality.
 */
export type EndpointOperation =
  | { kind: 'collection' }
  | { kind: 'entity' }
  | { kind: 'create' }
  | { kind: 'update' }
  | { kind: 'delete' }
  // `type` is the *parent* resource type; the definition passed to the add* call
  // is the related resource, so the parent isn't otherwise recoverable.
  | { kind: 'relationship'; type: string; key: string; cardinality: 'one' | 'many' };

export abstract class ServerBuilder {
  abstract addGet<TPath extends string, TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: FetchDeleteHandler<TPath, TDefinition>,
    operation: EndpointOperation,
  ): void;

  abstract addPost<
    TPath extends string,
    TDefinition extends ResourceDefinition,
  >(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
    operation: EndpointOperation,
  ): void;

  abstract addPatch<
    TPath extends string,
    TDefinition extends ResourceDefinition,
  >(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
    operation: EndpointOperation,
  ): void;

  abstract addDelete<
    TPath extends string,
    TDefinition extends ResourceDefinition,
  >(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
    operation: EndpointOperation,
  ): void;
}

export type StatusCode = 200 | 201 | 202 | 204 | 400 | 401 | 403 | 404 | 500;

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
