#!/usr/bin/env node

import * as dotenv from 'dotenv';
import minimist from 'minimist';
import { Server as McpServer } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { BusinessmapClient } from './businessmap-client';
import { BusinessmapConfig, CardType, LinkedCard } from './types';

// Carregar variáveis de ambiente do arquivo .env se existir
dotenv.config();

// Processar argumentos da linha de comando
const argv = minimist(process.argv.slice(2), {
  boolean: ['verbose', 'read-only', 'businessmap-ssl-verify'],
  string: ['transport', 'port', 'businessmap-url', 'businessmap-apikey', 'businessmap-boards-filter', 'host'],
  default: {
    transport: 'stdio',
    port: '8000',
    host: '0.0.0.0',
    verbose: false,
    'read-only': false,
    'businessmap-ssl-verify': true
  },
  alias: {
    v: 'verbose',
    t: 'transport',
    p: 'port',
    h: 'host'
  }
});

// Configurar nível de log
if (argv.verbose) {
  console.debug('Verbose logging enabled');
}

// Configurar cliente Businessmap
const config: BusinessmapConfig = {
  url: argv['businessmap-url'] || process.env.BUSINESSMAP_URL || '',
  apikey: argv['businessmap-apikey'] || process.env.BUSINESSMAP_APIKEY || '',
  sslVerify: argv['businessmap-ssl-verify'] !== false,
  readOnly: argv['read-only'] === true || process.env.READ_ONLY_MODE === 'true',
  boardsFilter: argv['businessmap-boards-filter'] ? 
    argv['businessmap-boards-filter'].split(',') : 
    process.env.BUSINESSMAP_BOARDS_FILTER ? 
      process.env.BUSINESSMAP_BOARDS_FILTER.split(',') : 
      undefined
};

// Verificar configuração
if (!config.url || !config.apikey) {
  console.error('Error: Businessmap URL and API key are required!');
  console.error('Please provide them via environment variables or command line arguments:');
  console.error('  --businessmap-url=https://your-instance.kanbanize.com');
  console.error('  --businessmap-apikey=YOUR_API_KEY');
  process.exit(1);
}

// Inicializar cliente
const businessmapClient = new BusinessmapClient(config);

// Log config info
console.log(`Starting MCP Businessmap server with ${argv.transport} transport`);
if (config.readOnly) {
  console.log('Running in READ-ONLY mode - all write operations are disabled');
}

// Criar servidor MCP
const server = new McpServer({
  name: 'mcp-businessmap',
  version: '1.1.5'
}, {
  capabilities: {
    tools: {}
  }
});

// Registrar ferramentas MCP
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [
    {
      name: 'businessmap_search',
      description: 'Search for cards in Businessmap',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Text to search for' },
          board_ids: { type: 'string', description: 'Comma-separated list of board IDs to search in' },
          max_results: { type: 'integer', description: 'Maximum number of results to return' }
        },
        required: ['query']
      }
    },
    
    {
      name: 'businessmap_get_card',
      description: 'Get a specific card from Businessmap by ID',
      inputSchema: {
        type: 'object',
        properties: {
          card_id: { type: 'string', description: 'Card ID to retrieve' }
        },
        required: ['card_id']
      }
    },
    
    {
      name: 'businessmap_create_card',
      description: 'Create a new card in Businessmap',
      inputSchema: {
        type: 'object',
        properties: {
          board_id: { type: 'string', description: 'Board ID' },
          workflow_id: { type: 'string', description: 'Workflow ID' },
          lane_id: { type: 'string', description: 'Lane ID' },
          column_id: { type: 'string', description: 'Column ID' },
          title: { type: 'string', description: 'Card title' },
          description: { type: 'string', description: 'Card description' },
          priority: { type: 'string', description: 'Card priority' },
          type_id: { type: 'number', description: 'Card type ID' },
          assignee_ids: { type: 'string', description: 'Comma-separated list of assignee IDs' },
          links_to_existing_cards_to_add_or_update: { type: 'array', description: 'Array of linked cards', items: { type: 'object', properties: { card_id: { type: 'string', description: 'Card ID' }, link_type: { type: 'string', description: 'Link type' } } } }
        },
        required: ['board_id', 'workflow_id', 'lane_id', 'column_id', 'title']
      }
    },
    
    {
      name: 'businessmap_update_card',
      description: 'Update an existing card in Businessmap',
      inputSchema: {
        type: 'object',
        properties: {
          card_id: { type: 'string', description: 'Card ID to update' },
          title: { type: 'string', description: 'New card title' },
          description: { type: 'string', description: 'New card description' },
          column_id: { type: 'string', description: 'New column ID' },
          lane_id: { type: 'string', description: 'New lane ID' },
          priority: { type: 'string', description: 'New priority' },
          assignee_ids: { type: 'string', description: 'Comma-separated list of new assignee IDs' }
        },
        required: ['card_id']
      }
    },
    
    {
      name: 'businessmap_delete_card',
      description: 'Delete a card from Businessmap',
      inputSchema: {
        type: 'object',
        properties: {
          card_id: { type: 'string', description: 'Card ID to delete' }
        },
        required: ['card_id']
      }
    },
    
    {
      name: 'businessmap_add_comment',
      description: 'Add a comment to a card in Businessmap',
      inputSchema: {
        type: 'object',
        properties: {
          card_id: { type: 'string', description: 'Card ID' },
          text: { type: 'string', description: 'Comment text' }
        },
        required: ['card_id', 'text']
      }
    },
    
    {
      name: 'businessmap_list_boards',
      description: 'List available boards in Businessmap',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    
    {
      name: 'businessmap_get_board',
      description: 'Get details of a specific board',
      inputSchema: {
        type: 'object',
        properties: {
          board_id: { type: 'string', description: 'Board ID to retrieve' }
        },
        required: ['board_id']
      }
    },

    {
      name: 'businessmap_get_board_lanes',
      description: 'Get lanes of a specific board',
      inputSchema: {
        type: 'object',
        properties: {
          board_id: { type: 'string', description: 'Board ID to retrieve' }
        },
        required: ['board_id']
      }
    },

    {
      name: 'businessmap_get_board_columns',
      description: 'Get columns of a specific board',
      inputSchema: {
        type: 'object',
        properties: {
          board_id: { type: 'string', description: 'Board ID to retrieve' }
        },
        required: ['board_id']
      }
    },

    {
      name: 'businessmap_get_board_structure',
      description: 'Get complete structure of a specific board including workflows, lanes, columns, and configuration',
      inputSchema: {
        type: 'object',
        properties: {
          board_id: { type: 'string', description: 'Board ID to retrieve structure for' }
        },
        required: ['board_id']
      }
    }
  ];

  return { tools };
});

// Registrar handler para chamadas de ferramentas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'businessmap_search': {
        const boardIds = args?.board_ids ? String(args.board_ids).split(',') : undefined;
        const result = await businessmapClient.searchCards({ 
          query: String(args?.query || ''), 
          boardIds, 
          maxResults: typeof args?.max_results === 'number' ? args.max_results : 50
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'businessmap_get_card': {
        const result = await businessmapClient.getCard(String(args?.card_id || ''));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'businessmap_create_card': {
        if (config.readOnly) {
          throw new Error('Cannot create card in read-only mode');
        }
        const assigneeIdsList = args?.assignee_ids ? String(args.assignee_ids).split(',') : undefined;
        const result = await businessmapClient.createCard({
          boardId: String(args?.board_id || ''),
          workflowId: String(args?.workflow_id || ''),
          laneId: String(args?.lane_id || ''),
          columnId: String(args?.column_id || ''),
          title: String(args?.title || ''),
          typeId: args?.type_id ? Number(args.type_id) : CardType.Story,
          description: args?.description ? String(args.description) : undefined,
          priority: args?.priority ? String(args.priority) : undefined,
          assigneeIds: assigneeIdsList,
          links_to_existing_cards_to_add_or_update: args?.links_to_existing_cards_to_add_or_update as LinkedCard[]
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'businessmap_update_card': {
        if (config.readOnly) {
          throw new Error('Cannot update card in read-only mode');
        }
        const assigneeIdsList = args?.assignee_ids ? String(args.assignee_ids).split(',') : undefined;
        const result = await businessmapClient.updateCard({
          cardId: String(args?.card_id || ''),
          title: args?.title ? String(args.title) : undefined,
          description: args?.description ? String(args.description) : undefined,
          columnId: args?.column_id ? String(args.column_id) : undefined,
          laneId: args?.lane_id ? String(args.lane_id) : undefined,
          priority: args?.priority ? String(args.priority) : undefined,
          assigneeIds: assigneeIdsList
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'businessmap_delete_card': {
        if (config.readOnly) {
          throw new Error('Cannot delete card in read-only mode');
        }
        const result = await businessmapClient.deleteCard(String(args?.card_id || ''));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'businessmap_add_comment': {
        if (config.readOnly) {
          throw new Error('Cannot add comment in read-only mode');
        }
        const result = await businessmapClient.addComment(String(args?.card_id || ''), String(args?.text || ''));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'businessmap_list_boards': {
        const result = await businessmapClient.listBoards();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'businessmap_get_board': {
        const result = await businessmapClient.getBoard(String(args?.board_id || ''));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'businessmap_get_board_lanes': {
        const result = await businessmapClient.getBoardLanes(String(args?.board_id || ''));
        return {
          content: [
            {
              type: 'text', 
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'businessmap_get_board_columns': {
        const result = await businessmapClient.getBoardColumns(String(args?.board_id || ''));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2) 
            }
          ]
        };
      }

      case 'businessmap_get_board_structure': {
        const result = await businessmapClient.getBoardStructure(String(args?.board_id || ''));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'businessmap_get_board_workflows': {
        const result = await businessmapClient.getBoardWorkflows(String(args?.board_id || ''));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    console.error(`Error in ${name}:`, error.message);
    throw new Error(`${name} failed: ${error.message}`);
  }
});

// Iniciar servidor
async function startServer() {
  try {
    if (argv.transport === 'stdio') {
      // Transporte STDIO - padrão MCP
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.error('MCP Businessmap server ready in STDIO mode');
    } 
    else if (argv.transport === 'sse') {
      // Para SSE, você pode implementar um transport customizado
      // ou usar HTTP transport da SDK se disponível
      throw new Error('SSE transport not yet implemented with SDK. Use stdio transport for now.');
    } 
    else {
      throw new Error(`Unsupported transport: ${argv.transport}`);
    }
  } catch (error: any) {
    console.error('Failed to start MCP server:', error.message);
    process.exit(1);
  }
}

// Iniciar servidor
startServer().catch(error => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
}); 

