import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { GeneratedTool } from './tools.js';

/**
 * Assembles an MCP `Server` that exposes the given tools (produced by one or
 * more `McpBuilder.build()` calls). Returns the server — register it with a
 * transport.
 */
export function createMcpServer(
  tools: GeneratedTool[],
  info: { name: string; version: string },
): { server: Server } {
  const byName = new Map(tools.map(tool => [tool.name, tool]));

  const server = new Server(info, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(({ name, description, inputSchema }) => ({
      name,
      description,
      // The SDK types inputSchema as its own JSON-schema object shape.
      inputSchema: inputSchema as { type: 'object' },
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const tool = byName.get(request.params.name);
    if (!tool) {
      return {
        content: [{ type: 'text', text: `Unknown tool: ${request.params.name}` }],
        isError: true,
      };
    }
    try {
      const text = await tool.handler(request.params.arguments ?? {});
      return { content: [{ type: 'text', text }] };
    } catch (error) {
      return {
        content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }],
        isError: true,
      };
    }
  });

  return { server };
}
