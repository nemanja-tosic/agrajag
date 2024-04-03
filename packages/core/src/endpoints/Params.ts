import { QueryParams } from './QueryParams.js';

import { ExtractParams } from './ExtractParams.js';

export type Params<TPath extends string = string> = ExtractParams<TPath> &
  QueryParams;
