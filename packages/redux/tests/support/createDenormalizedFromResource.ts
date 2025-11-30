import {
  Denormalized,
  JsonApiDeserializer,
  Resource,
  ResourceDefinition,
} from 'agrajag';

export function createDenormalizedFromResource<
  TDefinition extends ResourceDefinition,
>(
  definition: TDefinition,
  data: Resource<TDefinition> | Resource<TDefinition>[],
): Promise<Denormalized<TDefinition>> {
  return new JsonApiDeserializer().deserialize(definition, data as any);
}
