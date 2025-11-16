import jsonapiSerializer, { SerializerOptions } from 'jsonapi-serializer';
import { Serializer } from './Serializer.js';
import { QueryParams } from '../endpoints/QueryParams.js';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { Denormalized } from '../endpoints/Endpoints.js';
import { Resource } from '../resources/Resource.js';

export class JsonApiSerializer implements Serializer {
  serialize<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    data: Denormalized<TDefinition> | Denormalized<TDefinition>[],
    params: QueryParams,
  ): Resource<TDefinition> {
    const serialized = this.#createSerializer(definition, params).serialize(
      data,
    );

    // FIXME: issue in the library, returns an empty object
    serialized.included?.forEach((included: any) => {
      if (
        included['relationships'] &&
        Object.keys(included['relationships']).length === 0
      ) {
        delete included['relationships'];
      }
    });

    return serialized;
  }

  #createSerializer(
    definition: ResourceDefinition,
    params: QueryParams,
  ): jsonapiSerializer.Serializer {
    const type = definition.type;

    const options = this.#createOptions(definition, params, []);

    return new jsonapiSerializer.Serializer(type, options);
  }

  #createOptions(
    definition: ResourceDefinition,
    params: QueryParams,
    path: string[],
    options?: { relationshipKey?: string },
  ): SerializerOptions {
    const type = definition.type;
    const relationships = definition.relationships;
    const fields = params?.fields?.[type]?.split(',');

    const isInIncludes = (key: string) =>
      params?.include?.split(',').includes([...path, key].join('.')) ?? false;

    return {
      ref: 'id',
      included: options?.relationshipKey !== undefined,
      attributes: [
        ...(definition.attributes as string[]).filter(
          key => fields?.includes(key) ?? true,
        ),
        ...Object.keys(relationships).filter(key => isInIncludes(key)),
      ],
      // keep attribute keys as is
      keyForAttribute: attribute => attribute,
      ...Object.fromEntries(
        Object.entries(relationships)
          .filter(([key]) => isInIncludes(key))
          .map(
            ([key, value]) => [key, this.#unwrapRelationship(value)] as const,
          )
          .map(([key, relationship]) => [
            key,
            this.#createOptions(relationship, params, [...path, key], {
              relationshipKey: key,
            }),
          ]),
      ),
    };
  }

  #unwrapRelationship(
    relationship: ResourceDefinition | ResourceDefinition[],
  ): ResourceDefinition {
    return Array.isArray(relationship) ? relationship[0] : relationship;
  }
}
