import { MutateEndpointBody, ResourceDefinition } from 'agrajag';

export function createPatchRequest<TDefinition extends ResourceDefinition>(
  definition: TDefinition,
  data: MutateEndpointBody<TDefinition>['data'] & { id: string },
) {
  return { id: data.id, body: { data } };
}

export function createPostRequest<TDefinition extends ResourceDefinition>(
  definition: TDefinition,
  data: MutateEndpointBody<TDefinition>['data'] & { id?: string },
) {
  return { id: data.id, body: { data } };
}
