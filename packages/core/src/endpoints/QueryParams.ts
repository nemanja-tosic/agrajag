import { ResourceDefinition } from '../resources/ResourceDefinition.js';

export type QueryParams<
  TDefinition extends ResourceDefinition = ResourceDefinition,
> = {
  // TODO: should be based on TDefinition
  include?: string;
  fields?: Record<string, string>;
  sort?: TDefinition['attributes'];
  filter?: string;
};
