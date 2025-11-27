import {
  ResourceCapabilities,
  ResourceDefinition,
} from '../resources/ResourceDefinition.js';
import {
  Denormalized,
  Endpoints,
  Normalized,
  RelatedEndpointsWithBody,
  RelatedEndpointsWithoutBody,
  Stored,
} from './Endpoints.js';
import { Resolver } from '../application/Resolver.js';
import { Serializer } from '../serialization/Serializer.js';
import { QueryParams } from './QueryParams.js';
import { Resource } from '../resources/Resource.js';
import { ResourceLinkage } from '../resources/ResourceLinkageSchema.js';
import { IEndpointFactory } from './EndpointFactory.js';

export abstract class BaseEndpointFactory<
  TDefinition extends ResourceDefinition,
> implements IEndpointFactory<TDefinition>
{
  protected abstract createExternal(
    definition: TDefinition,
  ): Resolver<TDefinition>;

  async #serialize(
    definition: ResourceDefinition,
    external: Resolver,
    serializer: Serializer,
    entity: Stored<ResourceDefinition> | Stored<ResourceDefinition>[],
    params: QueryParams,
  ): Promise<Resource> {
    return serializer.serialize(
      definition,
      Array.isArray(entity)
        ? await Promise.all(
            entity.map(entity =>
              this.#denormalize(definition, entity, external.byId),
            ),
          )
        : await this.#denormalize(definition, entity, external.byId),
      params,
    );
  }

  createEndpoints(
    definition: TDefinition,
    serializer: Serializer,
    { createId = () => 'nullid' }: { createId?: () => string } = {},
  ): Endpoints<TDefinition> {
    let endpoints: Endpoints<TDefinition> = {};

    if (definition.capabilities & ResourceCapabilities.FetchSelf) {
      endpoints = {
        ...endpoints,
        fetch: {
          ...endpoints.fetch,
          self: async params => {
            await using external = this.createExternal(definition);

            const entity = await external.byId(params.id);
            if (!entity) {
              return undefined;
            }

            return this.#serialize(
              definition,
              external,
              serializer,
              entity,
              params,
            );
          },
        },
      };
    }

    if (definition.capabilities & ResourceCapabilities.FetchCollection) {
      endpoints = {
        ...endpoints,
        fetch: {
          ...endpoints.fetch,
          collection: async params => {
            await using external = this.createExternal(definition);

            const entities = await external.byType(definition.type, params);
            if (!entities) {
              return undefined;
            }

            const serialized = await this.#serialize(
              definition,
              external,
              serializer,
              entities,
              params,
            );

            return Array.isArray(serialized) && serialized.length === 1
              ? serialized[0]
              : serialized;
          },
        },
      };
    }

    if (
      definition.capabilities & ResourceCapabilities.FetchSelf ||
      definition.capabilities & ResourceCapabilities.FetchCollection
    ) {
      endpoints = {
        ...endpoints,
        fetch: {
          ...endpoints.fetch,
          related: Object.fromEntries(
            Object.entries(definition.relationships).map(([key, value]) => [
              key,
              async params => {
                await using external = this.createExternal(definition);

                const relationship = await external.relationshipByKey(
                  params.id,
                  key,
                );
                if (!relationship) {
                  return { data: null };
                }

                let definition1 = Array.isArray(value) ? value[0] : value;
                if (Array.isArray(relationship)) {
                  return {
                    data: relationship.map(r => ({
                      id: r.id,
                      type: definition1.type,
                    })),
                  } as ResourceLinkage;
                }

                return {
                  data: { id: relationship.id, type: definition1.type },
                } as ResourceLinkage;
              },
            ]),
          ) as RelatedEndpointsWithoutBody<TDefinition>,
        },
      };
    }

    if (definition.capabilities & ResourceCapabilities.Create) {
      endpoints = {
        ...endpoints,
        create: {
          ...endpoints.create,
          self: async (body, params) => {
            // TODO: this is not a possible case, this is a typedef issue
            if (!body.data) {
              throw new Error('Invalid request');
            }

            await using external = this.createExternal(definition);

            // TODO: introduce a createNormalized factory
            const entity: Normalized<TDefinition> = {
              id: body.data.id,
              ...body.data.attributes,
              ...Object.fromEntries(
                Object.entries(body.data.relationships ?? {}).map(
                  ([key, value]) =>
                    Array.isArray(value!.data)
                      ? [key, value!.data.map(d => d.id)]
                      : [key, value!.data?.id],
                ),
              ),
            };

            const data = await external.post(entity);
            await external.saveUow?.();
            if (!data) {
              return;
            }

            return this.#serialize(
              definition,
              external,
              serializer,
              data,
              params,
            );
          },
          related: Object.fromEntries(
            Object.entries(definition.relationships).map(([key]) => [
              key,
              async (body, params) => {
                await using external = this.createExternal(definition);

                const data = await external.postRelationship(
                  params.id,
                  body,
                  params,
                );
                await external.saveUow?.();
                return data;
              },
            ]),
          ) as RelatedEndpointsWithBody<TDefinition>,
        },
      };
    }

    if (definition.capabilities & ResourceCapabilities.Delete) {
      endpoints = {
        ...endpoints,
        delete: {
          ...endpoints.delete,
          self: async params => {
            await using external = this.createExternal(definition);

            const entity = await external.byId(params.id);
            if (!entity) {
              return undefined;
            }

            await external.delete(entity);
            await external.saveUow?.();

            return this.#serialize(
              definition,
              external,
              serializer,
              entity,
              params,
            );
          },
          related: Object.fromEntries(
            Object.entries(definition.relationships).map(([key]) => [
              key,
              async (body, params) => {
                await using external = this.createExternal(definition);

                const data = await external.deleteRelationship(
                  params.id,
                  body,
                  params,
                );
                await external.saveUow?.();
                return data;
              },
            ]),
          ) as RelatedEndpointsWithBody<TDefinition>,
        },
      };
    }

    if (definition.capabilities & ResourceCapabilities.Update) {
      endpoints = {
        ...endpoints,
        patch: {
          self: async (body, params) => {
            // TODO: this is not a possible case, this is a typedef issue
            if (!body.data || !body.data.id) {
              throw new Error('Invalid request');
            }

            await using external = this.createExternal(definition);

            const entity = {
              id: body.data.id,
              ...body.data.attributes,
              ...Object.fromEntries(
                Object.entries(body.data.relationships ?? {}).map(
                  ([key, value]) =>
                    Array.isArray(value!.data)
                      ? [key, value!.data.map(d => d.id)]
                      : [key, value!.data?.id],
                ),
              ),
            };

            const data = await external.patch(entity);
            await external.saveUow?.();
            if (!data) {
              return;
            }

            return this.#serialize(
              definition,
              external,
              serializer,
              data,
              params,
            );
          },
          related: Object.fromEntries(
            Object.entries(definition.relationships).map(([key]) => {
              return [
                key,
                async (body, params) => {
                  await using external = this.createExternal(definition);

                  const data = await external.patchRelationship(
                    params.id,
                    body,
                    params,
                  );
                  await external.saveUow?.();
                  return data;
                },
              ];
            }),
          ) as RelatedEndpointsWithBody<TDefinition>,
        },
      };
    }

    return endpoints;
  }

  async #denormalize<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    entity: Stored<TDefinition>,
    relationship: (key: string[]) => Promise<Stored<TDefinition>[]>,
  ): Promise<Denormalized<TDefinition>> {
    return {
      ...entity,
      ...Object.fromEntries(
        await Promise.all(
          Object.keys(definition.relationships)
            // if we get the denormalized version, we can skip loading relationships
            .filter(key => entity[key] === undefined)
            .map(async key => {
              const relationshipId = entity[this.normalizedRelKey(key)];
              if (relationshipId === undefined) {
                return [key, undefined];
              }

              return [key, await relationship(relationshipId)];
            }),
        ),
      ),
    };
  }

  protected normalizedRelKey(key: string): string {
    const isPlural = key.endsWith('s');
    const singularKey = isPlural ? key.slice(0, -1) : key;

    return isPlural ? `${singularKey}Ids` : `${singularKey}Id`;
  }
}
