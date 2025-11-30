import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { Denormalized } from '../endpoints/Endpoints.js';
import { Resource } from '../resources/Resource.js';

export interface Deserializer {
  deserialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    data: Resource<TDefinition>,
  ): Promise<Denormalized<TDefinition>>;
  deserialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    data: Resource<TDefinition>[],
  ): Promise<Denormalized<TDefinition>[]>;
}
