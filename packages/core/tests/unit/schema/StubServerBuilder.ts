import {
  EndpointSchema,
  FetchDeleteHandler,
  MutationHandler,
  ResourceDefinition,
  ServerBuilder,
} from 'agrajag';

export class StubServerBuilder extends ServerBuilder {
  addGet<TPath extends string, TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: FetchDeleteHandler<TPath, TDefinition>,
  ): void {}

  addPost<TPath extends string, TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
  ): void {}

  addPatch<TPath extends string, TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
  ): void {}

  addDelete<TPath extends string, TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
  ): void {}

  build() {}
}
