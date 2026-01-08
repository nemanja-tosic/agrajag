import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { Denormalized } from '../endpoints/Endpoints.js';
import {
  Document,
  MultipleResourceDocument,
  SingleResourceDocument,
} from '../resources/Resource.js';

export interface Deserializer {
  deserialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    data: SingleResourceDocument,
  ): Promise<Denormalized<TDefinition>>;
  deserialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    data: MultipleResourceDocument,
  ): Promise<Denormalized<TDefinition>[]>;
  deserialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    data: Document<TDefinition>,
  ): Promise<Denormalized<TDefinition> | Denormalized<TDefinition>[]>;
}
