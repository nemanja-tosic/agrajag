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
  byId(id: string): Promise<Stored<TDefinition> | undefined>;
  byId(ids: string[]): Promise<Stored<TDefinition>[]>;

  byType(
    type: string,
    params: QueryParams<TDefinition>,
  ): Promise<Stored<TDefinition>[]> | undefined;

  relationshipByKey(
    id: string,
    key: string & keyof TDefinition['relationships'],
  ): Promise<undefined | ResourceIdentifier | ResourceIdentifier[]>;

  post(
    entity: Normalized<TDefinition>,
  ): Promise<Stored<TDefinition> | undefined>;

  postRelationship(
    entityId: string,
    value: ResourceLinkage,
    params: QueryParams<TDefinition>,
  ): Promise<Stored<TDefinition> | undefined>;

  patch(
    entity: Normalized<TDefinition>,
  ): Promise<Stored<TDefinition> | undefined>;

  patchRelationship(
    entityId: string,
    value: ResourceLinkage,
    params: QueryParams<TDefinition>,
  ): Promise<Stored<TDefinition> | undefined>;

  delete(entity: Stored<TDefinition>): Promise<void>;

  deleteRelationship(
    entityId: string,
    value: ResourceLinkage,
    params: QueryParams<TDefinition>,
  ): Promise<Stored<TDefinition> | undefined>;

  saveUow?(): Promise<void>;
}
