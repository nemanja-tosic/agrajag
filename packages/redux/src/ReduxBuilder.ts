import { Definitions, DefinitionCollection, Builder } from 'agrajag';
import {
  Api,
  coreModuleName,
  reactHooksModuleName,
} from '@reduxjs/toolkit/query/react';
import { DefinitionsToEndpoints } from './DefinitionsToEndpoints.js';
import { FetchBaseQuery } from './FetchBaseQuery.js';
import { ReduxServerBuilder, ReduxEndpoints } from './ReduxServerBuilder.js';

export type BaseApi<
  ReducerPath extends string,
  TagTypes extends string,
  Endpoints extends ReduxEndpoints<ReducerPath, TagTypes>,
> = Api<
  FetchBaseQuery,
  Endpoints,
  ReducerPath,
  TagTypes,
  typeof reactHooksModuleName | typeof coreModuleName
>;

export type BuiltApi<
  TDefinitions extends Definitions,
  ReducerPath extends string,
  TagTypes extends string,
  Endpoints extends ReduxEndpoints<ReducerPath, TagTypes>,
> = Api<
  FetchBaseQuery,
  Endpoints & DefinitionsToEndpoints<TDefinitions, TagTypes, ReducerPath>,
  ReducerPath,
  TagTypes,
  typeof reactHooksModuleName | typeof coreModuleName
>;

export class ReduxBuilder<
  TDefinitions extends Definitions = {},
  ReducerPath extends string = 'api',
  TagTypes extends string = never,
> extends Builder<TDefinitions> {
  addDefinitions<TNewDefinitions extends Definitions>(
    definitions: DefinitionCollection<TNewDefinitions>,
  ): ReduxBuilder<TDefinitions & TNewDefinitions, ReducerPath, TagTypes> {
    this.definitions.addDefinitions(definitions);

    return this as unknown as ReduxBuilder<
      TDefinitions & TNewDefinitions,
      ReducerPath,
      TagTypes
    >;
  }

  build<
    ReducerPath extends string,
    TagTypes extends string,
    Endpoints extends ReduxEndpoints<ReducerPath, TagTypes>,
  >(
    api: Api<
      FetchBaseQuery,
      Endpoints,
      ReducerPath,
      TagTypes,
      typeof reactHooksModuleName | typeof coreModuleName
    >,
  ): BuiltApi<TDefinitions, ReducerPath, TagTypes, Endpoints> {
    this.addEndpointBuilder(new ReduxServerBuilder(api, this.definitions));

    for (const definition of this.definitions) {
      this.addResource(definition, {});
    }

    return api as any;
  }
}
