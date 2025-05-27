export interface TalentNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  position: number;
  maxRanks: number;
  currentRanks: number;
  requiredPoints: number;
  prerequisites: string[];
  connections: string[];
  x: number;
  y: number;
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
  maxTiers: number;
  pointsPerTier: number;
  nodeSize: number;
  tierSpacing: number;
  nodeSpacing: number;
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
}

export interface NodeTemplate {
  name: string;
  description: string;
  icon: string;
  maxRanks: number;
  requiredPoints: number;
}

export interface CreateNodeData {
  position: Position;
  template?: NodeTemplate;
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