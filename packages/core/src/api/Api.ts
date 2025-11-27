import { Endpoints } from '../endpoints/Endpoints.js';
import { ResourceDefinition } from '../resources/ResourceDefinition.js';

export type Api<
  TDefinition extends ResourceDefinition<any, any, any> = ResourceDefinition<
    any,
    any,
    any
  >,
> = Record<string, Endpoints<TDefinition>>;
