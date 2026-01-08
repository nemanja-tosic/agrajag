import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { Normalized, Stored } from '../endpoints/Endpoints.js';
import {
  ResourceIdentifier,
  ResourceLinkage,
} from '../resources/ResourceLinkageSchema.js';
import { QueryParams } from '../endpoints/QueryParams.js';

// @ts-ignore
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

export interface Resolver<
  TDefinition extends ResourceDefinition = ResourceDefinition,
> extends AsyncDisposable {
  byId(
    id: string,
    params: QueryParams<TDefinition>,
  ): Promise<Stored<TDefinition> | undefined>;

  byIds(
    ids: string[],
    params: QueryParams<TDefinition>,
  ): Promise<Stored<TDefinition>[]>;

  byType(
    type: TDefinition['type'],
    params: QueryParams<TDefinition>,
  ): Promise<Stored<TDefinition>[]> | undefined;

  relationshipByKey(
    id: string,
    key: string & keyof TDefinition['relationships'],
    params: QueryParams<TDefinition>,
  ): Promise<undefined | ResourceIdentifier | ResourceIdentifier[]>;

  post(
    entity: Normalized<TDefinition>,
    params: QueryParams<TDefinition>,
  ): Promise<Stored<TDefinition> | undefined>;

  postRelationship(
    entityId: string,
    value: ResourceLinkage,
    params: QueryParams<TDefinition>,
  ): Promise<Stored<TDefinition> | undefined>;

  patch(
    entity: Normalized<TDefinition>,
    params: QueryParams<TDefinition>,
  ): Promise<Stored<TDefinition> | undefined>;

  patchRelationship(
    entityId: string,
    value: ResourceLinkage,
    params: QueryParams<TDefinition>,
  ): Promise<Stored<TDefinition> | undefined>;

  delete(
    entity: Stored<TDefinition>,
    params: QueryParams<TDefinition>,
  ): Promise<void>;

  deleteRelationship(
    entityId: string,
    value: ResourceLinkage,
    params: QueryParams<TDefinition>,
  ): Promise<Stored<TDefinition> | undefined>;

  saveUow?(): Promise<void>;
}
