import { Builder, Definitions, DefinitionCollection } from 'agrajag';
import { McpServerBuilder, type McpServerBuilderOptions } from './McpServerBuilder.js';
import type { GeneratedTool } from './tools.js';

/**
 * Builds MCP tools from a set of agrajag resource definitions, mirroring
 * `ReduxBuilder`: collect definitions, then let core's `addResource` walk them
 * (capability gating + canonical paths) into an `McpServerBuilder` that emits the
 * tools. Compose several builders — one per origin/module — into a single MCP
 * server with `createMcpServer`.
 */
export class McpBuilder<TDefinitions extends Definitions = {}> extends Builder<TDefinitions> {
  addDefinitions<TNewDefinitions extends Definitions>(
    definitions: DefinitionCollection<TNewDefinitions>,
  ): McpBuilder<TDefinitions & TNewDefinitions> {
    this.definitions.addDefinitions(definitions);
    return this as unknown as McpBuilder<TDefinitions & TNewDefinitions>;
  }

  build(options: McpServerBuilderOptions): GeneratedTool[] {
    const serverBuilder = new McpServerBuilder(options, this.definitions);
    this.addEndpointBuilder(serverBuilder);
    for (const definition of this.definitions) {
      this.addResource(definition, {});
    }
    return serverBuilder.tools;
  }
}
