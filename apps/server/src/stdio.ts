import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {seed} from './seed.ts';
import {createMcpServer} from './mcp.ts';
import {user} from './crm.ts';
seed();const server=createMcpServer(user(process.env.MCP_USER_ID||'U-018'));await server.connect(new StdioServerTransport());

