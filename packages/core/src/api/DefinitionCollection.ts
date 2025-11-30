import { ResourceDefinition } from 'agrajag';

import { Definitions } from './Definitions.js';

export class DefinitionCollection<TDefinitions extends Definitions = {}>
  implements Iterable<ResourceDefinition>
{
  #definitions: Definitions = {};

  [Symbol.iterator](): Iterator<ResourceDefinition> {
    return Object.values(this.#definitions)[Symbol.iterator]();
  }

  addDefinitions<TNewDefinitions extends Definitions>(
    definitions: DefinitionCollection<TNewDefinitions>,
  ): DefinitionCollection<TDefinitions & TNewDefinitions> {
    for (const definition of definitions) {
      this.#definitions[definition.type] = definition;
    }

    return this as unknown as DefinitionCollection<
      TDefinitions & TNewDefinitions
    >;
  }

  addDefinition<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
  ): DefinitionCollection<
    TDefinitions & { [K in TDefinition['type']]: TDefinition }
  > {
    this.#definitions[definition.type] = definition;

    return this as unknown as DefinitionCollection<
      TDefinitions & { [K in TDefinition['type']]: TDefinition }
    >;
  }
}
