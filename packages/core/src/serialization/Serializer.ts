import { QueryParams } from '../endpoints/QueryParams.js';

import { ResourceDefinition } from '../resources/ResourceDefinition.js';
import { Denormalized } from '../endpoints/Endpoints.js';
import {
  MultipleResourceDocument,
  SingleResourceDocument,
} from '../resources/Resource.js';

export interface Serializer {
  serialize<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    data: Denormalized<TDefinition>,
    params: QueryParams<TDefinition>,
  ): SingleResourceDocument<TDefinition>;
  serialize<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    data: Denormalized<TDefinition>[],
    params: QueryParams<TDefinition>,
  ): MultipleResourceDocument<TDefinition>;
}
