export type GridFormat = 'compact' | 'large';

export interface GridConfig {
  width: number;
  height: number;
  cellSize: number;
  nodeSize: number;
  maxTrees: number;
}

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
  // Grid position is format-aware (compact: 0–3 x, 0–6 y; large: 0–8 x, 0–9 y)
  gridX: number;
  gridY: number;
}

export interface TalentTree {
  id: string;
  name: string;
  description: string;
  icon: string;
  backgroundImage?: string;
  nodes: TalentNode[];
  connections: TalentConnection[];
}

export interface TalentGroup {
  id: string;
  name: string;
  format: GridFormat;
  trees: TalentTree[];
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
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  nodeSize: number;
}

export enum EditorMode {
  EXPLORER = 'explorer',
  EDIT = 'edit'
}

export interface EditorState {
  mode: EditorMode;
  selectedTreeId: string | null;
  selectedNodeId: string | null;
  isConnecting: boolean;
  connectionStart: string | null;
  draggedNode: string | null;
  showNodeEditor: boolean;
  showTreeEditor: boolean;
  showNewGroup: boolean;
  pendingNodePosition: GridPosition | null;
  isCtrlHeld: boolean;
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
  x: number;
  y: number;
}

export interface TreeMetadata {
  id: string;
  name: string;
  description: string;
  icon?: string;
  backgroundImage?: string;
  author: string;
  version: string;
  created: string;
  modified: string;
}
