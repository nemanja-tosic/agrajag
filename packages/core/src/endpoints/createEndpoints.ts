import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { Denormalized, Endpoints, Normalized } from './Endpoints.js';
import { Resolver } from '../application/Resolver.js';
import { Serializer } from '../serialization/Serializer.js';
import { QueryParams } from './QueryParams.js';
import { Resource } from '../resources/Resource.js';

async function denormalize<TDefinition extends ResourceDefinition>(
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

export abstract class EndpointFactory<TDefinition extends ResourceDefinition> {
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
              denormalize(definition, entity, id => external.byId(id)),
            ),
          )
        : await denormalize(definition, entity, id => external.byId(id)),
      params,
    );
  }

  createEndpoints(
    definition: TDefinition,
    serializer: Serializer,
    { createId = () => 'nullid' }: { createId?: () => string } = {},
  ): Endpoints<TDefinition> {
    return {
      fetch: {
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
        collection: async params => {
            await using external = this.createExternal(definition);

          const entities = await external.byType(definition.type, {
            sort: params.sort,
          });

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
        // mismatch as fromEntries does not return a useful type
        // @ts-ignore
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

              return {
                data: Array.isArray(relationship)
                  ? relationship.map(r => ({
                      id: r.id,
                      type: definition1.type,
                    }))
                  : { id: relationship.id, type: definition1.type },
              };
            },
          ]),
        ),
      },
      create: {
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
        // mismatch as fromEntries does not return a useful type
        // @ts-ignore
        related: Object.fromEntries(
          Object.entries(definition.relationships).map(([key, value]) => [
            key,
            async (body, params) => {
              await using external = this.createExternal(definition);

              const entity = await external.byId(params.id);
              if (!entity) {
                throw new Error('Failed to load relationship');
              }

              const property = Array.isArray(value) ? `${key}Ids` : `${key}Id`;

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

              return external.relationshipByKey(params.id, key);
            },
          ]),
        ),
      },
      delete: {
        self: async (body, params) => {
          await using external = this.createExternal(definition);

          const entity = await external.byId(body.data!.id!);
          if (!entity) {
            throw new Error('Entity not found');
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
        // @ts-ignore
        related: Object.fromEntries(
          Object.entries(definition.relationships).map(([key, value]) => {
            return [
              key,
              async (body, params) => {
                await using external = this.createExternal(definition);

                const entity = await external.byId(params.id);
                if (!entity) {
                  throw new Error('Entity not found');
                }

                const property = Array.isArray(value)
                  ? `${key}Ids`
                  : `${key}Id`;

                if (Array.isArray(body.data)) {
                  Object.assign(entity, {
                    [property]: (entity as any)[property].filter(
                      // @ts-ignore
                      id => !body.data.some(d => d.id === id),
                    ),
                  });
                } else {
                  delete (entity as any)[property];
                }

                if (!external.saveUow) {
                  await external.save(entity);
                }
                await external.saveUow?.();

                return external.relationshipByKey(params.id, key);
              },
            ];
          }),
        ),
      },
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
        // @ts-ignore
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

                return external.relationshipByKey(params.id, key);
              },
            ];
          }),
        ),
      },
    };
  }
}
