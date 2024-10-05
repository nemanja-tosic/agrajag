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
    entity: Normalized<ResourceDefinition> | Normalized<ResourceDefinition>[],
    params: QueryParams,
  ): Promise<Resource> {
    return serializer.serialize(
      definition,
      Array.isArray(entity)
        ? await Promise.all(
            entity.map(entity =>
              this.#denormalize(definition, entity, id => external.byId(id)),
            ),
          )
        : await this.#denormalize(definition, entity, id => external.byId(id)),
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

            const entities = await external.byType(definition.type, {
              sort: params.sort,
            });

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

            // convert from JSON:API to RavenDB entity
            // is this not the deserialized version?
            const entity: Normalized<TDefinition> = {
              id: body.data.id ?? createId(),
              ...body.data.attributes,
              // relationships are marked with a suffix of "Id" or "Ids"
              ...Object.fromEntries(
                Object.entries(body.data.relationships ?? {}).map(
                  ([key, value]) =>
                    Array.isArray(value.data)
                      ? [`${key}Ids`, value.data.map(d => d.id)]
                      : [`${key}Id`, value.data?.id],
                ),
              ),
            };

            await external.save(entity);
            await external.saveUow?.();

            // separate load step as we potentially need to load relationships
            const data = await external.byId(entity.id);
            if (!data) {
              throw new Error('Failed to save entity');
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
            Object.entries(definition.relationships).map(([key, value]) => [
              key,
              async (body, params) => {
                await using external = this.createExternal(definition);

                const entity = await external.byId(params.id);
                if (!entity) {
                  throw new Error('Failed to load relationship');
                }

                const property = Array.isArray(value)
                  ? `${key}Ids`
                  : `${key}Id`;

                Object.assign(entity, {
                  [property]: Array.isArray(body.data)
                    ? [
                        ...new Set(
                          entity[property].concat(body.data.map(d => d.id)),
                        ),
                      ]
                    : body.data.id,
                });

                if (!external.saveUow) {
                  await external.save(entity);
                }
                await external.saveUow?.();

                return {
                  data: await external.relationshipByKey(params.id, key),
                } as ResourceLinkage;
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
            Object.entries(definition.relationships).map(([key, value]) => {
              return [
                key,
                async params => {
                  await using external = this.createExternal(definition);

                  const entity = await external.byId(params.id);
                  if (!entity) {
                    return undefined;
                  }

                  const property = Array.isArray(value)
                    ? `${key}Ids`
                    : `${key}Id`;

                  delete (entity as any)[property];

                  if (!external.saveUow) {
                    await external.save(entity);
                  }
                  await external.saveUow?.();

                  return {
                    data: await external.relationshipByKey(params.id, key),
                  } as ResourceLinkage;
                },
              ];
            }),
          ) as RelatedEndpointsWithoutBody<TDefinition>,
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

            const entity = await external.byId(body.data.id);
            if (!entity) {
              return undefined;
            }

            Object.assign(
              entity,
              Object.assign(entity, {
                ...body.data.attributes,
                // relationships are marked with a suffix of "Id" or "Ids"
                ...Object.fromEntries(
                  Object.entries(body.data.relationships ?? {}).map(
                    ([key, value]) =>
                      Array.isArray(value.data)
                        ? [`${key}Ids`, value.data.map(d => d.id)]
                        : [`${key}Id`, value.data?.id],
                  ),
                ),
              }),
            );

            if (!external.saveUow) {
              await external.save(entity);
            }
            await external.saveUow?.();

            const data = await external.byId(body.data.id);
            if (!data) {
              throw new Error('Failed to save entity');
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
            Object.entries(definition.relationships).map(([key, value]) => {
              return [
                key,
                async (body, params) => {
                  await using external = this.createExternal(definition);

                  const entity = await external.byId(params.id);
                  if (!entity) {
                    return undefined;
                  }

                  const property = Array.isArray(value)
                    ? `${key}Ids`
                    : `${key}Id`;

                  Object.assign(entity, {
                    [property]: Array.isArray(body.data)
                      ? [...new Set(body.data.map(d => d.id))]
                      : body.data.id,
                  });

                  if (!external.saveUow) {
                    await external.save(entity);
                  }
                  await external.saveUow?.();

                  return {
                    data: await external.relationshipByKey(params.id, key),
                  } as ResourceLinkage;
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
    entity: Normalized<TDefinition>,
    relationship: (key: string) => Promise<Normalized<TDefinition> | undefined>,
  ): Promise<Denormalized<TDefinition>> {
    return {
      ...entity,
      ...Object.fromEntries(
        await Promise.all(
          Object.entries(definition.relationships).map(async ([key, value]) => {
            const relationshipId =
              entity[Array.isArray(value) ? `${key}Ids` : `${key}Id`];
            if (relationshipId === undefined) {
              return [key, undefined];
            }

            return [key, await relationship(relationshipId)];
          }),
        ),
      ),
    };
  }
}
