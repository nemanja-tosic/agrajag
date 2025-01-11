import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { Stored } from '../endpoints/Endpoints.js';
import { ResourceIdentifier } from '../resources/ResourceLinkageSchema.js';
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

  save(entity: Stored<TDefinition>): Promise<void>;

  delete(entity: Stored<TDefinition>): Promise<void>;

  saveUow?(): Promise<void>;
}
