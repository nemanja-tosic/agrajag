import {
  Denormalized,
  JsonApiSerializer,
  QueryParams,
  ResourceDefinition,
} from 'agrajag';

export function createResponseBody<TDefinition extends ResourceDefinition>(
  definition: TDefinition,
  data: Denormalized<TDefinition> | Denormalized<TDefinition>[],
  params: QueryParams = {},
) {
  return new JsonApiSerializer().serialize(definition, data, params);
}
