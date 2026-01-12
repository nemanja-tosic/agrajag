import { ResourceDefinition } from 'agrajag';
import { Deserializer } from './Deserializer.js';
import {
  Resource,
  Document,
  SingleResourceDocument,
  MultipleResourceDocument,
} from '../resources/Resource.js';
import { Denormalized } from '../endpoints/Endpoints.js';
import { QueryParams } from '../endpoints/QueryParams.js';

export class JsonApiDeserializer implements Deserializer {
  deserialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    document: SingleResourceDocument<TDefinition>,
    params: QueryParams<TDefinition>,
  ): Promise<Denormalized<TDefinition>>;
  deserialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    document: MultipleResourceDocument<TDefinition>,
    params: QueryParams<TDefinition>,
  ): Promise<Denormalized<TDefinition>[]>;
  async deserialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    { data, included = [] }: Document<TDefinition>,
    params: QueryParams<TDefinition>,
  ): Promise<Denormalized<TDefinition> | Denormalized<TDefinition>[]> {
    const cache = new Map<string, any>();

    const includedMap = new Map<string, Resource>();
    for (const resource of included.concat(data)) {
      const key = `${resource.type}:${resource.id}`;
      includedMap.set(key, resource);
    }

    return Array.isArray(data)
      ? data.map(resource =>
          this.#deserializeResource(resource, includedMap, cache, params),
        )
      : this.#deserializeResource(data, includedMap, cache, params);
  }

  #deserializeResource<TDefinition extends ResourceDefinition>(
    resource: Resource<TDefinition>,
    includes: Map<string, Resource>,
    cache: Map<string, Denormalized<ResourceDefinition>>,
    params: QueryParams<TDefinition>,
    path: string[] = [],
  ): Denormalized<TDefinition> {
    const key = `${resource.type}:${resource.id}`;

    // FIXME: preserve identity map. Perhaps use a proxy?
    // const cached = cache.get(key);
    // if (cached) {
    //   return cached as Denormalized<TDefinition>;
    // }

    const obj: any = { id: resource.id, ...resource.attributes };

    cache.set(key, obj);

    if (resource.relationships) {
      for (const [relName, rel] of Object.entries(resource.relationships)) {
        if (!rel.data) {
          obj[relName] = null;
          continue;
        }

        const relPath = path.concat(relName);

        if (Array.isArray(rel.data)) {
          obj[relName] = rel.data.map(ref => {
            const refKey = `${ref.type}:${ref.id}`;
            const includedResource = includes.get(refKey);

            return includedResource &&
              params.include?.includes(relPath.join('.'))
              ? this.#deserializeResource(
                  includedResource,
                  includes,
                  cache,
                  params,
                  relPath,
                )
              : { id: ref.id };
          });
        } else {
          const refKey = `${rel.data.type}:${rel.data.id}`;
          const includedResource = includes.get(refKey);

          obj[relName] =
            includedResource && params.include?.includes(relPath.join('.'))
              ? this.#deserializeResource(
                  includedResource,
                  includes,
                  cache,
                  params,
                  relPath,
                )
              : { id: rel.data.id };
        }
      }
    }

    return obj;
  }
}
