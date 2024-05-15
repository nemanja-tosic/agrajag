import { ResourceDefinition } from '../resources/ResourceDefinition.js';

export type QueryParams<
  TDefinition extends ResourceDefinition = ResourceDefinition,
> = {
  include: string | undefined;
  fields: Record<string, string> | undefined;
  sort: TDefinition['attributes'];
};
