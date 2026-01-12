import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { Denormalized } from '../endpoints/Endpoints.js';
import {
  Document,
  MultipleResourceDocument,
  SingleResourceDocument,
} from '../resources/Resource.js';
import { QueryParams } from '../endpoints/QueryParams.js';

export interface Deserializer {
  deserialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    data: SingleResourceDocument,
    params: QueryParams<TDefinition>
  ): Promise<Denormalized<TDefinition>>;
  deserialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    data: MultipleResourceDocument,
    params: QueryParams<TDefinition>
  ): Promise<Denormalized<TDefinition>[]>;
  deserialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    data: Document<TDefinition>,
    params: QueryParams<TDefinition>
  ): Promise<Denormalized<TDefinition> | Denormalized<TDefinition>[]>;
}
