import type { DeserializerOptions } from 'jsonapi-serializer';
import jsonApiDeserializer from 'jsonapi-serializer';
import { ResourceDefinition } from 'agrajag';
import { Deserializer } from './Deserializer.js';
import { Resource } from '../resources/Resource.js';
import { Denormalized } from '../endpoints/Endpoints.js';

export class JsonApiDeserializer<TDefinition extends ResourceDefinition>
  implements Deserializer
{
  #proxy = new Proxy(
    { keyForAttribute: attr => attr } satisfies DeserializerOptions,
    {
      get(target, p, receiver) {
        const ignoredProperties: (keyof DeserializerOptions)[] = [
          'id',
          'transform',
          'pluralizeType',
          'typeAsAttribute',
          'keyForAttribute',
        ];
        if (
          ignoredProperties.includes(p as keyof DeserializerOptions) ||
          p in target
        ) {
          return Reflect.get(target, p, receiver);
        }

        // default missing properties to known attributes
        return {
          valueForRelationship: (
            relationship: { id: string },
            value: Record<string, unknown>,
          ) => value ?? { id: relationship.id },
        };
      },
    },
  );

  deserialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    data: Resource<TDefinition>,
  ): Promise<Denormalized<TDefinition>>;
  deserialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    data: Resource<TDefinition>[],
  ): Promise<Denormalized<TDefinition>[]>;
  deserialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    data: Resource<TDefinition> | Resource<TDefinition>[],
  ): Promise<Denormalized<TDefinition> | Denormalized<TDefinition>[]> {
    return new jsonApiDeserializer.Deserializer(this.#proxy).deserialize(data);
  }
}
