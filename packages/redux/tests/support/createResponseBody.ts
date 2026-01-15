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
  const serializer = new JsonApiSerializer();

  if (Array.isArray(data)) {
    return serializer.serialize(definition, data, params);
  }

  return serializer.serialize(definition, data, params);
}
