import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { Denormalized, Stored } from '../endpoints/Endpoints.js';
import {
  ResourceIdentifier,
  ResourceLinkage,
} from '../resources/ResourceLinkageSchema.js';
import { QueryParams } from '../endpoints/QueryParams.js';

// @ts-ignore
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

/**
 * The authenticated principal attached to a request's resolver params.
 *
 * An `interface` (not a `type` alias) with an open index signature so it stays
 * record-compatible *and* consumers can expand it via declaration merging:
 *
 *   declare module 'agrajag' {
 *     interface User { tenantId?: string }
 *   }
 */
export interface User {
  [key: string]: unknown;
}

export type ResolverContext = Record<string, unknown>;

export type ResolverQueryParams<
  TDefinition extends ResourceDefinition,
  TUser extends User,
> = QueryParams<TDefinition> & { user?: TUser; context?: ResolverContext };

export interface Resolver<
  TDefinition extends ResourceDefinition = ResourceDefinition,
  TUser extends User = User,
> extends AsyncDisposable {
  byId(
    id: string,
    params: ResolverQueryParams<TDefinition, TUser>,
  ): Promise<Stored<TDefinition> | undefined>;

  byIds(
    ids: string[],
    params: ResolverQueryParams<TDefinition, TUser>,
  ): Promise<Stored<TDefinition>[]>;

  byType(
    type: TDefinition['type'],
    params: ResolverQueryParams<TDefinition, TUser>,
  ): Promise<Stored<TDefinition>[]> | undefined;

  relationshipByKey(
    id: string,
    key: string & keyof TDefinition['relationships'],
    params: ResolverQueryParams<TDefinition, TUser>,
  ): Promise<undefined | ResourceIdentifier | ResourceIdentifier[]>;

  post(
    entity: Denormalized<TDefinition>,
    params: ResolverQueryParams<TDefinition, TUser>,
  ): Promise<Stored<TDefinition> | undefined>;

  postRelationship(
    entityId: string,
    value: ResourceLinkage,
    params: ResolverQueryParams<TDefinition, TUser>,
  ): Promise<Stored<TDefinition> | undefined>;

  patch(
    entity: Denormalized<TDefinition>,
    params: ResolverQueryParams<TDefinition, TUser>,
  ): Promise<Stored<TDefinition> | undefined>;

  patchRelationship(
    entityId: string,
    value: ResourceLinkage,
    params: ResolverQueryParams<TDefinition, TUser>,
  ): Promise<Stored<TDefinition> | undefined>;

  delete(
    entity: Stored<TDefinition>,
    params: ResolverQueryParams<TDefinition, TUser>,
  ): Promise<void>;

  deleteRelationship(
    entityId: string,
    value: ResourceLinkage,
    params: ResolverQueryParams<TDefinition, TUser>,
  ): Promise<Stored<TDefinition> | undefined>;

  saveUow?(): Promise<void>;
}
