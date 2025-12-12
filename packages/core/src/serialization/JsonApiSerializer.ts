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
    params: QueryParams<TDefinition>,
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

  #createSerializer<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    params: QueryParams<TDefinition>,
  ): jsonapiSerializer.Serializer {
    const type = definition.type;

    const options = this.#createOptions(definition, params, [type]);

    return new jsonapiSerializer.Serializer(type, options);
  }

  #createOptions<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    params: QueryParams<TDefinition>,
    path: string[],
    options?: { relationshipKey?: string },
  ): SerializerOptions {
    const type = definition.type;
    const relationships = definition.relationships;

    const isInIncludes = (key: string) =>
      params?.include?.split(',').includes([...path.slice(1), key].join('.')) ??
      false;

    const isInFields = (key: string) =>
      params?.fields?.[
        path.join('.') as keyof NonNullable<typeof params.fields>
      ]?.includes(key) ?? true;

    return {
      ref: 'id',
      included: options?.relationshipKey !== undefined,
      attributes: [
        ...(definition.attributes as string[]).filter(isInFields),
        ...Object.keys(relationships),
      ],
      keyForAttribute: attribute => attribute,
      ...Object.fromEntries(
        Object.entries(relationships)
          .map(
            ([key, value]) => [key, this.#unwrapRelationship(value)] as const,
          )
          .map(([key, relationship]) => [
            key,
            isInIncludes(key)
              ? this.#createOptions(
                  relationship,
                  params as any,
                  [...path, key],
                  { relationshipKey: key },
                )
              : { ref: 'id' },
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
