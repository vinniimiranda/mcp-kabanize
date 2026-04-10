export interface BusinessmapConfig {
  url: string;
  apikey: string;
  sslVerify: boolean;
  boardsFilter?: string[];
  readOnly: boolean;
}

export interface LinkedCard {
  card_id: string;
  link_type: "parent" | "child" | "related";
}

export enum CardType {
  Story =  2,
  SB = 3,
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  boardId: string;
  columnId?: string;
  laneId?: string;
  priority?: string;
  assigneeIds?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  linkedCards?: LinkedCard[];
}

export interface Comment {
  id: string;
  cardId: string;
  text: string;
  authorId: string;
  authorName?: string;
  createdAt: string;
}

export interface SearchParams {
  query: string;
  boardIds?: string[];
  maxResults?: number;
}

export interface CardCreateParams {
  boardId: string;
  workflowId: string;
  laneId: string;
  columnId: string;
  title: string;
  typeId: CardType;
  description?: string;
  priority?: string;
  assigneeIds?: string[];
  links_to_existing_cards_to_add_or_update?: LinkedCard[];
}

export interface CardCreatedResponse {
  id: string;
  link: string;
}

export interface CardUpdateParams {
  cardId: string;
  title?: string;
  description?: string;
  columnId?: string;
  laneId?: string;
  priority?: string;
  assigneeIds?: string[];
}

export interface Board {
  id: string;
  name: string;
  description?: string;
} 

export interface BoardLanes {
  lane_id: number;
  name: string;
  description?: string;
}

export interface BoardColumns {
  column_id: string;
  name: string;
  description?: string;
  section: number;
  position: number;
}

export interface BoardWorkflows {
  workflow_id: number;
  name: string;
  position: number;
  is_enabled: boolean;
}

// Novas interfaces para a estrutura completa do board
export interface BoardStructure {
  data: {
    version: string;
    workspace_id: number;
    board_id: number;
    name: string;
    description: string;
    is_archived: number;
    workflow_order: number[];
    workflows: Record<string, WorkflowStructure>;
    lanes: Record<string, LaneStructure>;
    columns: Record<string, ColumnStructure>;
    child_columns: Record<string, number[]>;
    column_checklist_items: Record<string, ChecklistItemStructure>;
    size_type: number;
    allow_exceeding: number;
    autoarchive_cards_after: number;
    limit_type: number;
    allow_repeating_custom_card_ids: number;
    is_discard_reason_required: number;
    size_formula: string;
    deadline_formula: string;
    default_sender_user_id: number;
    default_receiver_user_id: number;
    allow_generic_blocker: number;
    cell_card_orderings: Record<string, Record<string, string>>;
    cell_limits: Record<string, Record<string, number>>;
    lane_section_limits: Record<string, Record<string, number>>;
    merged_areas: Record<string, MergedAreaStructure>;
    revision: number;
  };
}

export interface WorkflowStructure {
  type: number;
  position: number;
  is_enabled: number;
  is_collapsible: number;
  name: string;
  top_lanes: number[];
  bottom_lanes: number[];
  top_columns: number[];
  bottom_columns: number[];
  section_columns: Record<string, number[]>;
}

export interface LaneStructure {
  workflow_id: number;
  name: string;
  description: string;
  color: string;
}

export interface ColumnStructure {
  workflow_id: number;
  section: number;
  parent_column_id: number;
  name: string;
  description: string;
  color: string;
  limit: number;
  cards_per_row: number;
  flow_type: number;
  card_ordering: string | null;
  checklist_items: number[];
}

export interface ChecklistItemStructure {
  column_id: number;
  text: string;
  position: number;
}

export interface MergedAreaStructure {
  primary_column_id: number;
  limit: number;
  card_ordering: string | null;
  lane_ids: number[];
  column_ids: number[];
}
