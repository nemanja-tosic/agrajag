import {
  Endpoints,
  IEndpointFactory,
  ResourceDefinition,
  Serializer,
} from 'agrajag';

export class StubEndpointFactory<TDefinition extends ResourceDefinition>
  implements IEndpointFactory<TDefinition>
{
  createEndpoints(
    definition: TDefinition,
    serializer: Serializer,
    options?: { createId?: () => string },
  ): Endpoints<TDefinition> {
    return {
      fetch: {
        collection: async () => ({ data: [] }) as never,
      },
    };
  }
}
