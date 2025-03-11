import {
  Endpoints,
  IEndpointFactory,
  ResourceDefinition,
  Serializer,
} from 'agrajag';

export class StubEndpointFactory
  implements IEndpointFactory<ResourceDefinition>
{
  createEndpoints(
    definition: ResourceDefinition,
    serializer: Serializer,
    options?: { createId?: () => string },
  ): Endpoints<ResourceDefinition> {
    return {
      fetch: {
        collection: async () => {
          return [];
        },
      },
    };
  }
}
