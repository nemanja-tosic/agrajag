import {
  HasCapability,
  ResourceCapabilities,
  ResourceDefinition,
} from '../resources/ResourceDefinition.js';

export type Definitions = Record<string, ResourceDefinition>;

export type Fetchable<TDefinitions extends Definitions> = {
  [K in keyof TDefinitions as HasCapability<
    TDefinitions[K]['capabilities'],
    ResourceCapabilities.FetchSelf | ResourceCapabilities.FetchCollection
  > extends true
    ? K
    : never]: TDefinitions[K];
};
