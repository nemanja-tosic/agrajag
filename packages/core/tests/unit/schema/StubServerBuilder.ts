import {
  EndpointSchema,
  FetchDeleteHandler,
  MutationHandler,
  ResourceDefinition,
  ServerBuilder,
} from 'agrajag';

export class StubServerBuilder extends ServerBuilder {
  addGet<
    TPath extends string = string,
    TDefinition extends ResourceDefinition = ResourceDefinition,
  >(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: FetchDeleteHandler<TPath, TDefinition>,
  ): void {}

  addPost<TPath extends string = string>(
    definition: ResourceDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {}

  addPatch<TPath extends string = string>(
    definition: ResourceDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {}

  addDelete<TPath extends string = string>(
    definition: ResourceDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {}

  build() {}
}
