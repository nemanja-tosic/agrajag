import { QueryParams } from '../endpoints/QueryParams.js';

import {
  ResourceDefinition,
} from '../resources/ResourceDefinition.js';
import { Denormalized } from '../endpoints/Endpoints.js';
import { Resource } from '../resources/Resource.js';

export interface Serializer {
  serialize<TDefinition extends ResourceDefinition>(
    schema: TDefinition,
    data: Denormalized<TDefinition> | Denormalized<TDefinition>[],
    params: QueryParams,
  ): Resource<TDefinition>;
}
