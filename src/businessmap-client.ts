import axios, { AxiosInstance } from 'axios';
import { 
  BusinessmapConfig, 
  Card, 
  Comment, 
  SearchParams, 
  CardCreateParams,
  CardUpdateParams,
  Board,
  BoardLanes,
  BoardColumns,
  BoardWorkflows,
  BoardStructure,
  CardCreatedResponse
} from './types';

export class BusinessmapClient {
  private client: AxiosInstance;
  private config: BusinessmapConfig;
  
  constructor(config: BusinessmapConfig) {
    this.config = config;
    
    this.client = axios.create({
      baseURL: this.config.url,
      headers: {
        'apikey': this.config.apikey,
        'Content-Type': 'application/json'
      },
      validateStatus: (status) => status < 500
    });
  }
  
  private checkReadOnly(operation: string): void {
    if (this.config.readOnly) {
      throw new Error(`Cannot perform operation "${operation}" in read-only mode`);
    }
  }
  
  // Busca cards no Businessmap
  async searchCards(params: SearchParams): Promise<Card[]> {
    try {
      const response = await this.client.get('/api/v2/cards', {
        params: {
          query: params.query,
          board_ids: params.boardIds ? params.boardIds.join(',') : undefined,
          limit: params.maxResults || 50
        }
      });
      
      if (response.status !== 200) {
        throw new Error(`Failed to search cards: ${response.statusText}`);
      }
      
      // Filtrar por boards se necessário
      let results = response.data.data || [];
      if (!Array.isArray(results)) {
        console.warn('API response data is not an array:', results);
        results = [];
      }
      if (this.config.boardsFilter && this.config.boardsFilter.length > 0) {
        results = results.filter((card: any) => 
          this.config.boardsFilter!.includes(card.board_id?.toString() || '')
        );
      }
      
      // Transformar para o formato esperado
      return results.map((card: any) => ({
        id: card.id?.toString() || '',
        title: card.title || '',
        description: card.description || '',
        boardId: card.board_id?.toString() || '',
        columnId: card.column_id?.toString() || undefined,
        laneId: card.lane_id?.toString() || undefined,
        priority: card.priority || undefined,
        assigneeIds: card.assignee_ids?.map((id: number) => id.toString()) || [],
        tags: card.tags || [],
        createdAt: card.created_at || undefined,
        updatedAt: card.updated_at || undefined
      }));
    } catch (error: any) {
      console.error('Error searching cards:', error.message);
      throw error;
    }
  }
  
  // Obter detalhes de um card específico
  async getCard(cardId: string): Promise<Card> {
    try {
      const response = await this.client.get(`/api/v2/cards/${cardId}`);
            
      const card = response.data.data;
      return {
        id: card.id?.toString() || cardId,
        title: card.title || '',
        description: card.description || '',
        boardId: card.board_id?.toString() || '',
        columnId: card.column_id?.toString() || undefined,
        laneId: card.lane_id?.toString() || undefined,
        priority: card.priority || undefined,
        assigneeIds: card.assignee_ids?.map((id: number) => id.toString()) || [],
        tags: card.tags || [],
        createdAt: card.created_at || undefined,
        updatedAt: card.updated_at || undefined,
        linkedCards: card.linked_cards || []
      };
    } catch (error: any) {
      console.error(`Error getting card ${cardId}:`, error.message);
      throw error;
    }
  }
  
  // Criar um novo card
  async createCard(params: CardCreateParams): Promise<CardCreatedResponse > {
    this.checkReadOnly('createCard');
    
    try {
      const payload = {
        board_id: params.boardId,
        workflow_id: params.workflowId,
        lane_id: params.laneId,
        column_id: params.columnId,
        title: params.title,
        type_id: params.typeId,
        description: params.description,
        priority: params.priority,
        assignee_ids: params.assigneeIds,
        links_to_existing_cards_to_add_or_update: params.links_to_existing_cards_to_add_or_update?.map((link) => ({
          linked_card_id: link.card_id,
          link_type: link.link_type
        }))
      }
      
      const response = await this.client.post('/api/v2/cards', payload);
      
      // Verificar se a resposta foi bem-sucedida
      if (response.status !== 201 && response.status !== 200) {
        throw new Error(`Failed to create card: ${response.statusText} - ${JSON.stringify(response.data)}`);
      }

      const cards = response.data.data || [];
      const card = cards[cards.length - 1];
      return {
        id: card.card_id.toString(),
        link: `${this.config.url}/ctrl_board/${params.boardId}/cards/${card.card_id}/details`
      };
    } catch (error: any) {
      console.error('Error creating card:', error?.response?.data || error.message);
      throw error;
    }
  }
  
  // Atualizar um card existente
  async updateCard(params: CardUpdateParams): Promise<Card> {
    this.checkReadOnly('updateCard');
    
    try {
      const updateData: any = {};
      if (params.title) updateData.title = params.title;
      if (params.description) updateData.description = params.description;
      if (params.columnId) updateData.column_id = params.columnId;
      if (params.laneId) updateData.lane_id = params.laneId;
      if (params.priority) updateData.priority = params.priority;
      if (params.assigneeIds) updateData.assignee_ids = params.assigneeIds;
      
      const response = await this.client.patch(`/api/v2/cards/${params.cardId}`, updateData);
      
      if (response.status !== 200) {
        throw new Error(`Failed to update card: ${response.statusText}`);
      }
      
      const card = response.data;
      return {
        id: card.id.toString(),
        title: card.title,
        description: card.description,
        boardId: card.board_id.toString(),
        columnId: card.column_id?.toString(),
        laneId: card.lane_id?.toString(),
        priority: card.priority,
        assigneeIds: card.assignee_ids?.map((id: number) => id.toString()),
        tags: card.tags,
        createdAt: card.created_at,
        updatedAt: card.updated_at
      };
    } catch (error: any) {
      console.error(`Error updating card ${params.cardId}:`, error.message);
      throw error;
    }
  }
  
  // Excluir um card
  async deleteCard(cardId: string): Promise<boolean> {
    this.checkReadOnly('deleteCard');
    
    try {
      const response = await this.client.delete(`/api/v2/cards/${cardId}`);
      
      if (response.status !== 204) {
        throw new Error(`Failed to delete card: ${response.statusText}`);
      }
      
      return true;
    } catch (error: any) {
      console.error(`Error deleting card ${cardId}:`, error.message);
      throw error;
    }
  }
  
  // Adicionar comentário a um card
  async addComment(cardId: string, text: string): Promise<Comment> {
    this.checkReadOnly('addComment');
    
    try {
      const response = await this.client.post(`/api/v2/cards/${cardId}/comments`, {
        text: text
      });
      
      if (response.status !== 201) {
        throw new Error(`Failed to add comment: ${response.statusText}`);
      }
      
      const comment = response.data;
      return {
        id: comment.id.toString(),
        cardId: comment.card_id.toString(),
        text: comment.text,
        authorId: comment.author_id.toString(),
        authorName: comment.author_name,
        createdAt: comment.created_at
      };
    } catch (error: any) {
      console.error(`Error adding comment to card ${cardId}:`, error.message);
      throw error;
    }
  }
  
  // Listar quadros disponíveis
  async listBoards(): Promise<Board[]> {
    try {
      const response = await this.client.get('/api/v2/boards');
      
      if (response.status !== 200) {
        throw new Error(`Failed to list boards: ${response.statusText}`);
      }
      
      let boards = response.data.data || [];
      
      // Filtrar boards se necessário
      if (this.config.boardsFilter && this.config.boardsFilter.length > 0) {
        boards = boards.filter((board: any) => 
          this.config.boardsFilter!.includes(board.id?.toString() || '')
        );
      }
      
      return boards.map((board: any) => ({
        id: board.board_id?.toString() || '',
        name: board.name || '',
        description: board.description || ''
      }));
    } catch (error: any) {
      console.error('Error listing boards:', error.message);
      throw error;
    }
  }
  
  // Obter detalhes de um quadro específico
  async getBoard(boardId: string): Promise<Board> {
    try {
      const response = await this.client.get(`/api/v2/boards/${boardId}`);
      
      if (response.status !== 200) {
        throw new Error(`Failed to get board: ${response.statusText}`);
      }
      
      const board = response.data.data;
      return {
        id: board.board_id?.toString() || '',
        name: board.name,
        description: board.description
      };
    } catch (error: any) {
      console.error(`Error getting board ${boardId}:`, error.message);
      throw error;
    }
  }
  async getBoardLanes(boardId: string): Promise<BoardLanes[]> {
    try {
      const response = await this.client.get(`/api/v2/boards/${boardId}/lanes`);
      
      if (response.status !== 200) {
        throw new Error(`Failed to get board: ${response.statusText}`);
      }
      
      const lanes = response.data.data;
      return lanes.map((lane: any) => ({
        lane_id: lane.lane_id,
        name: lane.name,
        description: lane.description
      }));
    } catch (error: any) {
      console.error(`Error getting board lanes ${boardId}:`, error.message);
      throw error;
    }
  }
  async getBoardColumns(boardId: string): Promise<BoardColumns[]> {
    try {
      const response = await this.client.get(`/api/v2/boards/${boardId}/columns`);
      if (response.status !== 200) {
        throw new Error(`Failed to get board columns: ${response.statusText}`);
      }
      const columns = response.data.data;
      return columns.map((column: any) => ({
        column_id: column.column_id,
        name: column.name,
        description: column.description,
        section: column.section,
        position: column.position
      }));
    } catch (error: any) {
      console.error(`Error getting board columns ${boardId}:`, error.message);
      throw error;
    }
  }
  async getBoardWorkflows(boardId: string): Promise<BoardWorkflows[]> {
    try {
      const response = await this.client.get(`/api/v2/boards/${boardId}/workflows`);
      if (response.status !== 200) {
        throw new Error(`Failed to get board workflows: ${response.statusText}`);
      }
      const workflows = response.data.data;
      return workflows.map((workflow: any) => ({
        workflow_id: workflow.workflow_id,
        name: workflow.name,
        position: workflow.position,
        is_enabled: workflow.is_enabled
      }));
    } catch (error: any) {
      console.error(`Error getting board workflows ${boardId}:`, error.message);
      throw error;
    }
  }

  // Obter estrutura completa do board
  async getBoardStructure(boardId: string): Promise<BoardStructure> {
    try {
      const response = await this.client.get(`/api/v2/boards/${boardId}/currentStructure`);
      
      if (response.status !== 200) {
        throw new Error(`Failed to get board structure: ${response.statusText}`);
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`Error getting board structure ${boardId}:`, error.message);
      throw error;
    }
  }
} 
