import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { Denormalized, Normalized } from '../endpoints/Endpoints.js';

// @ts-ignore
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

export interface Resolver<
  TDefinition extends ResourceDefinition = ResourceDefinition,
> extends AsyncDisposable {
  // realistically, this should be shallow - do not force the client to
  // load all relationships
  byId(id: string): Promise<Normalized<TDefinition> | undefined>;
  byId(ids: string[]): Promise<Normalized<TDefinition>[]>;

  byType(
    type: string,
    options?: { sort?: TDefinition['attributes'] },
  ): Promise<Normalized<TDefinition>[]>;

  relationshipByKey(
    id: string,
    key: keyof TDefinition['relationships'],
  ): Promise<
    | undefined
    | Normalized<ResourceDefinition>
    | Normalized<ResourceDefinition>[]
  >;

  updateProperty?<TProp extends keyof TDefinition['attributes']>(
    id: string,
    key: TProp,
    value: TDefinition['attributes'][TProp],
  ): Promise<void>;

  save(entity: Normalized<TDefinition>): Promise<void>;

  delete(entity: Normalized<TDefinition>): Promise<void>;

  saveUow?(): Promise<void>;
}
