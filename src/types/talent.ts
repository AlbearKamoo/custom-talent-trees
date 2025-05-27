export interface TalentNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxRanks: number;
  currentRanks: number;
  requiredPoints: number;
  prerequisites: string[];
  connections: string[];
  // Grid position (0-8 for x, 0-9 for y)
  gridX: number;
  gridY: number;
}

export interface TalentTree {
  id: string;
  name: string;
  description: string;
  totalPoints: number;
  spentPoints: number;
  nodes: TalentNode[];
  connections: TalentConnection[];
}

export interface TalentConnection {
  id: string;
  from: string;
  to: string;
  isActive: boolean;
}

export enum TalentState {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  UNLOCKED = 'unlocked',
  SELECTED = 'selected',
  MAXED = 'maxed'
}

export interface TalentTreeState {
  selectedNodes: Record<string, number>;
  availablePoints: number;
  spentPoints: number;
  hoveredNode: string | null;
}

export interface Position {
  x: number;
  y: number;
}

export interface TalentTreeConfig {
  gridWidth: number; // 9 columns
  gridHeight: number; // 10 rows
  cellSize: number; // Size of each grid cell
  nodeSize: number; // Size of nodes within cells
}

// Editor-specific types
export enum EditorMode {
  SIMULATE = 'simulate',
  EDIT = 'edit'
}

export interface EditorState {
  mode: EditorMode;
  selectedNodeId: string | null;
  isConnecting: boolean;
  connectionStart: string | null;
  draggedNode: string | null;
  showNodeEditor: boolean;
  showTreeEditor: boolean;
  pendingNodePosition: GridPosition | null; // For creating new nodes
  isCtrlHeld: boolean; // For connection deletion mode
}

export interface NodeTemplate {
  name: string;
  description: string;
  icon: string;
  maxRanks: number;
  requiredPoints: number;
}

export interface CreateNodeData {
  gridPosition: GridPosition;
  template?: NodeTemplate;
}

export interface GridPosition {
  x: number; // 0-8
  y: number; // 0-9
}

export interface TreeMetadata {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  created: string;
  modified: string;
} 