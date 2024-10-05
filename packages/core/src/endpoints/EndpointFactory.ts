import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { Serializer } from '../serialization/Serializer.js';
import { Endpoints } from './Endpoints.js';

export interface IEndpointFactory<TDefinition extends ResourceDefinition> {
  createEndpoints(
    definition: TDefinition,
    serializer: Serializer,
    options?: { createId?: () => string },
  ): Endpoints<TDefinition>;
}
