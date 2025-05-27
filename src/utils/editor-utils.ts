import { TalentNode, TalentTree, TalentConnection, Position, NodeTemplate, TreeMetadata, GridPosition } from '../types/talent';

export const generateNodeId = (): string => {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateConnectionId = (): string => {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createEmptyTree = (metadata?: Partial<TreeMetadata>): TalentTree => {
  return {
    id: metadata?.id || `tree_${Date.now()}`,
    name: metadata?.name || 'New Talent Tree',
    description: metadata?.description || 'A custom talent tree',
    totalPoints: 51,
    spentPoints: 0,
    nodes: [],
    connections: [],
  };
};

export const createNode = (
  gridPosition: GridPosition,
  template?: NodeTemplate
): TalentNode => {
  const id = generateNodeId();
  return {
    id,
    name: template?.name || 'New Talent',
    description: template?.description || 'A new talent ability',
    icon: template?.icon || '⭐',
    maxRanks: template?.maxRanks || 1,
    currentRanks: 0,
    requiredPoints: template?.requiredPoints || 0,
    prerequisites: [],
    connections: [],
    gridX: gridPosition.x,
    gridY: gridPosition.y,
  };
};

export const addNodeToTree = (tree: TalentTree, node: TalentNode): TalentTree => {
  return {
    ...tree,
    nodes: [...tree.nodes, node],
  };
};

export const removeNodeFromTree = (tree: TalentTree, nodeId: string): TalentTree => {
  // Remove the node
  const filteredNodes = tree.nodes.filter(n => n.id !== nodeId);
  
  // Remove all connections involving this node
  const filteredConnections = tree.connections.filter(
    c => c.from !== nodeId && c.to !== nodeId
  );
  
  // Remove this node from prerequisites of other nodes
  const updatedNodes = filteredNodes.map(node => ({
    ...node,
    prerequisites: node.prerequisites.filter(prereq => prereq !== nodeId),
    connections: node.connections.filter(conn => conn !== nodeId),
  }));
  
  return {
    ...tree,
    nodes: updatedNodes,
    connections: filteredConnections,
  };
};

export const updateNode = (tree: TalentTree, nodeId: string, updates: Partial<TalentNode>): TalentTree => {
  return {
    ...tree,
    nodes: tree.nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    ),
  };
};

export const moveNode = (tree: TalentTree, nodeId: string, newGridPosition: GridPosition): TalentTree => {
  return updateNode(tree, nodeId, {
    gridX: newGridPosition.x,
    gridY: newGridPosition.y,
  });
};

export const createConnection = (fromNodeId: string, toNodeId: string): TalentConnection => {
  return {
    id: generateConnectionId(),
    from: fromNodeId,
    to: toNodeId,
    isActive: false,
  };
};

export const addConnectionToTree = (
  tree: TalentTree,
  fromNodeId: string,
  toNodeId: string
): TalentTree => {
  // Check if connection already exists
  const connectionExists = tree.connections.some(
    c => (c.from === fromNodeId && c.to === toNodeId) ||
         (c.from === toNodeId && c.to === fromNodeId)
  );
  
  if (connectionExists) {
    return tree;
  }

  // Find the nodes to validate same-tier restriction
  const fromNode = tree.nodes.find(n => n.id === fromNodeId);
  const toNode = tree.nodes.find(n => n.id === toNodeId);
  
  if (!fromNode || !toNode) {
    return tree; // Invalid nodes
  }

  // Prevent connections between nodes of the same tier (same gridY)
  if (fromNode.gridY === toNode.gridY) {
    console.warn(`Cannot create connection between nodes of the same tier (row ${fromNode.gridY})`);
    return tree;
  }
  
  const newConnection = createConnection(fromNodeId, toNodeId);
  
  // Update the "to" node's prerequisites
  const updatedNodes = tree.nodes.map(node => {
    if (node.id === toNodeId) {
      return {
        ...node,
        prerequisites: [...node.prerequisites, fromNodeId],
      };
    }
    return node;
  });
  
  return {
    ...tree,
    nodes: updatedNodes,
    connections: [...tree.connections, newConnection],
  };
};

export const removeConnection = (tree: TalentTree, connectionId: string): TalentTree => {
  const connection = tree.connections.find(c => c.id === connectionId);
  if (!connection) return tree;
  
  // Remove from connections array
  const filteredConnections = tree.connections.filter(c => c.id !== connectionId);
  
  // Remove from prerequisites
  const updatedNodes = tree.nodes.map(node => {
    if (node.id === connection.to) {
      return {
        ...node,
        prerequisites: node.prerequisites.filter(prereq => prereq !== connection.from),
      };
    }
    return node;
  });
  
  return {
    ...tree,
    nodes: updatedNodes,
    connections: filteredConnections,
  };
};

export const validateTree = (tree: TalentTree): string[] => {
  const errors: string[] = [];
  
  // Check for orphaned connections
  tree.connections.forEach(connection => {
    const fromExists = tree.nodes.some(n => n.id === connection.from);
    const toExists = tree.nodes.some(n => n.id === connection.to);
    
    if (!fromExists || !toExists) {
      errors.push(`Invalid connection: ${connection.id}`);
    }
  });

  // Check for same-tier connections
  tree.connections.forEach(connection => {
    const fromNode = tree.nodes.find(n => n.id === connection.from);
    const toNode = tree.nodes.find(n => n.id === connection.to);
    
    if (fromNode && toNode && fromNode.gridY === toNode.gridY) {
      errors.push(`Invalid same-tier connection between "${fromNode.name}" and "${toNode.name}" (row ${fromNode.gridY})`);
    }
  });
  
  // Check for circular dependencies
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  const hasCycle = (nodeId: string): boolean => {
    if (recursionStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const node = tree.nodes.find(n => n.id === nodeId);
    if (node) {
      for (const prereq of node.prerequisites) {
        if (hasCycle(prereq)) return true;
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  };
  
  for (const node of tree.nodes) {
    if (hasCycle(node.id)) {
      errors.push(`Circular dependency detected involving node: ${node.name}`);
      break;
    }
  }
  
  return errors;
};

export const exportTreeAsJSON = (tree: TalentTree): string => {
  return JSON.stringify(tree, null, 2);
};

export const importTreeFromJSON = (jsonString: string): TalentTree => {
  try {
    const parsed = JSON.parse(jsonString);
    // Validate the structure
    if (!parsed.id || !parsed.name || !Array.isArray(parsed.nodes)) {
      throw new Error('Invalid tree format');
    }
    return parsed as TalentTree;
  } catch (error) {
    throw new Error(`Failed to import tree: ${error}`);
  }
};

// Grid utility functions
export const GRID_CONFIG = {
  width: 9,
  height: 10,
  cellSize: 80,
  nodeSize: 60,
};

export const gridToPixel = (gridPos: GridPosition): Position => {
  return {
    x: gridPos.x * GRID_CONFIG.cellSize + GRID_CONFIG.cellSize / 2,
    y: gridPos.y * GRID_CONFIG.cellSize + GRID_CONFIG.cellSize / 2,
  };
};

export const pixelToGrid = (pixelPos: Position): GridPosition => {
  return {
    x: Math.max(0, Math.min(GRID_CONFIG.width - 1, Math.floor(pixelPos.x / GRID_CONFIG.cellSize))),
    y: Math.max(0, Math.min(GRID_CONFIG.height - 1, Math.floor(pixelPos.y / GRID_CONFIG.cellSize))),
  };
};

export const isValidGridPosition = (gridPos: GridPosition): boolean => {
  return gridPos.x >= 0 && gridPos.x < GRID_CONFIG.width && 
         gridPos.y >= 0 && gridPos.y < GRID_CONFIG.height;
};

export const isGridPositionOccupied = (tree: TalentTree, gridPos: GridPosition): boolean => {
  return tree.nodes.some(node => node.gridX === gridPos.x && node.gridY === gridPos.y);
};

export const getNodeAt = (tree: TalentTree, gridPos: GridPosition): TalentNode | null => {
  return tree.nodes.find(node => node.gridX === gridPos.x && node.gridY === gridPos.y) || null;
};

export const getAdjacentPositions = (gridPos: GridPosition): GridPosition[] => {
  const adjacent: GridPosition[] = [];
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 1, y: 0 },  // right
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
  ];
  
  directions.forEach(dir => {
    const newPos = { x: gridPos.x + dir.x, y: gridPos.y + dir.y };
    if (isValidGridPosition(newPos)) {
      adjacent.push(newPos);
    }
  });
  
  return adjacent;
};

export const getNodeTemplates = (): NodeTemplate[] => {
  return [
    {
      name: 'Basic Ability',
      description: 'A basic talent ability',
      icon: '⚔️',
      maxRanks: 1,
      requiredPoints: 0,
    },
    {
      name: 'Passive Skill',
      description: 'A passive enhancement',
      icon: '🛡️',
      maxRanks: 3,
      requiredPoints: 0,
    },
    {
      name: 'Ultimate Ability',
      description: 'A powerful ultimate ability',
      icon: '💥',
      maxRanks: 1,
      requiredPoints: 20,
    },
    {
      name: 'Mastery',
      description: 'A mastery talent with multiple ranks',
      icon: '⭐',
      maxRanks: 5,
      requiredPoints: 5,
    },
  ];
}; 