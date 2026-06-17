import { Builder, Definitions, DefinitionCollection, Endpoints, ResourceDefinition } from 'agrajag';
import { McpServerBuilder, type McpServerBuilderOptions } from './McpServerBuilder.js';
import type { GeneratedTool } from './tools.js';

export interface McpBuildOptions extends McpServerBuilderOptions {
  /**
   * Resolver-backed endpoints per definition. Required for the in-process
   * executor (its handler calls these); omit for the HTTP executor, which never
   * invokes the handler and defaults to empty endpoints.
   */
  endpoints?: (definition: ResourceDefinition) => Endpoints<ResourceDefinition>;
}

/**
 * Builds MCP tools from a set of agrajag resource definitions, mirroring
 * `ReduxBuilder`: collect definitions, then let core's `addResource` walk them
 * (capability gating + paths + operation) into an `McpServerBuilder` that emits
 * the tools. Compose several builders — one per origin/module — into a single
 * MCP server with `createMcpServer`.
 */
export class McpBuilder<TDefinitions extends Definitions = {}> extends Builder<TDefinitions> {
  addDefinitions<TNewDefinitions extends Definitions>(
    definitions: DefinitionCollection<TNewDefinitions>,
  ): McpBuilder<TDefinitions & TNewDefinitions> {
    this.definitions.addDefinitions(definitions);
    return this as unknown as McpBuilder<TDefinitions & TNewDefinitions>;
  }

  build({ endpoints, ...serverBuilderOptions }: McpBuildOptions): GeneratedTool[] {
    const serverBuilder = new McpServerBuilder(serverBuilderOptions);
    this.addEndpointBuilder(serverBuilder);
    for (const definition of this.definitions) {
      this.addResource(definition, endpoints ? endpoints(definition) : {});
    }
    return serverBuilder.tools;
  }
}
