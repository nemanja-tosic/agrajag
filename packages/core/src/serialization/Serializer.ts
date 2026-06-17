import { QueryParams } from '../endpoints/QueryParams.js';

import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { Denormalized } from '../endpoints/Endpoints.js';
import {
  MultipleResourceDocument,
  SingleResourceDocument,
} from '../resources/Resource.js';

/** JSON:API top-level `links` (e.g. pagination); values may be relative URLs. */
export interface TopLevelLinks {
  self?: string;
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
}

export interface SerializeOptions {
  links?: TopLevelLinks;
  meta?: Record<string, unknown>;
}

export interface Serializer {
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
}
