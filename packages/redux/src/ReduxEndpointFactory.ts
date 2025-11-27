import {
  Endpoints,
  IEndpointFactory,
  ResourceDefinition,
  Serializer,
} from 'agrajag';

export class ReduxEndpointFactory<TDefinition extends ResourceDefinition>
  implements IEndpointFactory<TDefinition>
{
  createEndpoints(
    definition: TDefinition,
    serializer: Serializer,
    options?: { createId?: () => string },
  ): Endpoints<TDefinition> {
    return undefined;
  }
}
