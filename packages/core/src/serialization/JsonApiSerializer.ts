import jsonapiSerializer, { SerializerOptions } from 'jsonapi-serializer';
import { Serializer, SerializeOptions } from './Serializer.js';
import { QueryParams } from '../endpoints/QueryParams.js';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { Denormalized } from '../endpoints/Endpoints.js';
import {
  Document,
  MultipleResourceDocument,
  SingleResourceDocument,
} from '../resources/Resource.js';

export class JsonApiSerializer implements Serializer {
  serialize<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    data: Denormalized<TDefinition>,
    params: QueryParams<TDefinition>,
    options?: SerializeOptions,
  ): SingleResourceDocument<TDefinition>;
  serialize<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    data: Denormalized<TDefinition>[],
    params: QueryParams<TDefinition>,
    options?: SerializeOptions,
  ): MultipleResourceDocument<TDefinition>;
  serialize<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    data: Denormalized<TDefinition> | Denormalized<TDefinition>[],
    params: QueryParams<TDefinition>,
    options?: SerializeOptions,
  ): Document<TDefinition> {
    const serialized = this.#createSerializer(definition, params, options).serialize(
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
    serializeOptions?: SerializeOptions,
  ): jsonapiSerializer.Serializer {
    const type = definition.type;

    const options = this.#createOptions(definition, params, [type]);
    if (serializeOptions?.links) {
      options.topLevelLinks = Object.fromEntries(
        Object.entries(serializeOptions.links).filter(([, value]) => value !== undefined),
      ) as Record<string, string>;
    }
    if (serializeOptions?.meta) {
      options.meta = serializeOptions.meta;
    }

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

    const isInIncludes = (key: string) => {
      const dotted = [...path.slice(1), key].join('.');
      return (
        params?.include?.some(
          included => included === dotted || included.startsWith(`${dotted}.`),
        ) ?? false
      );
    };

    const isInFields = (key: string) =>
      params?.fields?.[
        path.join('.') as keyof NonNullable<typeof params.fields>
      ]?.includes(key) ?? true;

    const includedRelationships = Object.entries(relationships)
      .filter(([key]) => isInIncludes(key))
      .map(([key, value]) => [key, this.#unwrapRelationship(value)] as const);

    return {
      ref: 'id',
      included: options?.relationshipKey !== undefined,
      attributes: [
        ...(definition.attributes as string[]).filter(isInFields),
        ...includedRelationships.map(([key]) => key),
      ],
      keyForAttribute: attribute => attribute,
      ...Object.fromEntries(
        includedRelationships.map(([key, relationship]) => [
          key,
          this.#createOptions(relationship, params as any, [...path, key], {
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
