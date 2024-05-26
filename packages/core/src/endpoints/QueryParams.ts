import { ResourceDefinition } from '../resources/ResourceDefinition.js';

export type QueryParams<
  TDefinition extends ResourceDefinition = ResourceDefinition,
> = {
  // TODO: should be based on TDefinition
  include: string | undefined;
  fields: Record<string, string> | undefined;
  sort: TDefinition['attributes'];
};
