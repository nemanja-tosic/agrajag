import { QueryParams } from './QueryParams.js';

import { ExtractParams } from './ExtractParams.js';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';

export type Params<
  TPath extends string = string,
  TDefinition extends ResourceDefinition = ResourceDefinition,
> = ExtractParams<TPath> & QueryParams<TDefinition>;
