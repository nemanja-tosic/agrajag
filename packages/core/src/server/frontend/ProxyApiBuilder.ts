import { EndpointSchema } from '../../endpoints/Endpoints.js';
import { ResourceDefinition } from '../../resources/ResourceDefinition.js';

export abstract class ProxyApiBuilder {
  abstract addGet<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
  ): void;

  abstract addPost<TPath extends string = string>(
    definition: ResourceDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
  ): void;

  abstract addPatch<TPath extends string = string>(
    definition: ResourceDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
  ): void;

  abstract addDelete<TPath extends string = string>(
    definition: ResourceDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
  ): void;
}
