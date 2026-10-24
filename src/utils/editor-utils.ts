import {
  TalentNode,
  TalentTree,
  TalentGroup,
  TalentConnection,
  Position,
  NodeTemplate,
  TreeMetadata,
  GridPosition,
  GridFormat,
  GridConfig,
} from '../types/talent';

export const GRID_FORMATS: Record<GridFormat, GridConfig> = {
  compact: { width: 4, height: 7, cellSize: 80, nodeSize: 60, maxTrees: 3 },
  large: { width: 9, height: 10, cellSize: 80, nodeSize: 60, maxTrees: 5 },
};

export const getGridConfig = (format: GridFormat): GridConfig => GRID_FORMATS[format];

export const generateNodeId = (): string => {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateConnectionId = (): string => {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateTreeId = (): string => {
  return `tree_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateGroupId = (): string => {
  return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createEmptyTree = (metadata?: Partial<TreeMetadata>): TalentTree => {
  return {
    id: metadata?.id || generateTreeId(),
    name: metadata?.name || 'New Talent Tree',
    description: metadata?.description || 'A custom talent tree',
    icon: metadata?.icon || '⭐',
    backgroundImage: metadata?.backgroundImage,
    nodes: [],
    connections: [],
  };
};

export const createEmptyGroup = (
  format: GridFormat,
  name?: string
): TalentGroup => {
  const tree = createEmptyTree({ name: 'New Talent Tree' });
  return {
    id: generateGroupId(),
    name: name || (format === 'compact' ? 'New Compact Group' : 'New Large Group'),
    format,
    trees: [tree],
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
  const filteredNodes = tree.nodes.filter(n => n.id !== nodeId);

  const filteredConnections = tree.connections.filter(
    c => c.from !== nodeId && c.to !== nodeId
  );

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
  const connectionExists = tree.connections.some(
    c => (c.from === fromNodeId && c.to === toNodeId) ||
         (c.from === toNodeId && c.to === fromNodeId)
  );

  if (connectionExists) {
    return tree;
  }

  const fromNode = tree.nodes.find(n => n.id === fromNodeId);
  const toNode = tree.nodes.find(n => n.id === toNodeId);

  if (!fromNode || !toNode) {
    return tree;
  }

  if (fromNode.gridY === toNode.gridY) {
    console.warn(`Cannot create connection between nodes of the same tier (row ${fromNode.gridY})`);
    return tree;
  }

  const newConnection = createConnection(fromNodeId, toNodeId);

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

  const filteredConnections = tree.connections.filter(c => c.id !== connectionId);

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

  tree.connections.forEach(connection => {
    const fromExists = tree.nodes.some(n => n.id === connection.from);
    const toExists = tree.nodes.some(n => n.id === connection.to);

    if (!fromExists || !toExists) {
      errors.push(`Invalid connection: ${connection.id}`);
    }
  });

  tree.connections.forEach(connection => {
    const fromNode = tree.nodes.find(n => n.id === connection.from);
    const toNode = tree.nodes.find(n => n.id === connection.to);

    if (fromNode && toNode && fromNode.gridY === toNode.gridY) {
      errors.push(`Invalid same-tier connection between "${fromNode.name}" and "${toNode.name}" (row ${fromNode.gridY})`);
    }
  });

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

export const validateGroup = (group: TalentGroup): string[] => {
  const errors: string[] = [];
  const config = getGridConfig(group.format);

  if (group.trees.length === 0) {
    errors.push('A talent group must contain at least one tree');
  }
  if (group.trees.length > config.maxTrees) {
    errors.push(`This ${group.format} group can have at most ${config.maxTrees} trees`);
  }

  group.trees.forEach((tree, index) => {
    tree.nodes.forEach(node => {
      if (!isValidGridPosition({ x: node.gridX, y: node.gridY }, config)) {
        errors.push(`Tree "${tree.name}": node "${node.name}" is outside the ${config.width}×${config.height} grid`);
      }
    });
    validateTree(tree).forEach(error => {
      errors.push(`Tree ${index + 1} (${tree.name}): ${error}`);
    });
  });

  return errors;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeTree = (raw: Record<string, unknown>): TalentTree => {
  if (!raw.id || !raw.name || !Array.isArray(raw.nodes)) {
    throw new Error('Invalid tree format');
  }
  return {
    id: String(raw.id),
    name: String(raw.name),
    description: String(raw.description ?? ''),
    icon: typeof raw.icon === 'string' && raw.icon ? raw.icon : '⭐',
    backgroundImage: typeof raw.backgroundImage === 'string' ? raw.backgroundImage : undefined,
    nodes: raw.nodes as TalentTree['nodes'],
    connections: Array.isArray(raw.connections) ? raw.connections as TalentTree['connections'] : [],
  };
};

export const exportGroupAsJSON = (group: TalentGroup): string => {
  return JSON.stringify(group, null, 2);
};

export const importGroupFromJSON = (jsonString: string): TalentGroup => {
  const parsed: unknown = JSON.parse(jsonString);
  if (!isRecord(parsed)) {
    throw new Error('Invalid group format');
  }

  if (Array.isArray(parsed.trees)) {
    if (!parsed.id || !parsed.name || (parsed.format !== 'compact' && parsed.format !== 'large')) {
      throw new Error('Invalid group format');
    }
    const format = parsed.format as GridFormat;
    const trees = (parsed.trees as unknown[]).map(tree => {
      if (!isRecord(tree)) throw new Error('Invalid tree in group');
      return normalizeTree(tree);
    });
    const maxTrees = getGridConfig(format).maxTrees;
    if (trees.length > maxTrees) {
      throw new Error(`A ${format} group can have at most ${maxTrees} trees`);
    }
    if (trees.length === 0) {
      throw new Error('A talent group must contain at least one tree');
    }
    return {
      id: String(parsed.id),
      name: String(parsed.name),
      format,
      trees,
    };
  }

  // Legacy single-tree JSON → wrap as a large group
  const tree = normalizeTree(parsed);
  return {
    id: generateGroupId(),
    name: tree.name,
    format: 'large',
    trees: [tree],
  };
};

export const gridToPixel = (gridPos: GridPosition, config: GridConfig): Position => {
  return {
    x: gridPos.x * config.cellSize + config.cellSize / 2,
    y: gridPos.y * config.cellSize + config.cellSize / 2,
  };
};

export const pixelToGrid = (pixelPos: Position, config: GridConfig): GridPosition => {
  return {
    x: Math.max(0, Math.min(config.width - 1, Math.floor(pixelPos.x / config.cellSize))),
    y: Math.max(0, Math.min(config.height - 1, Math.floor(pixelPos.y / config.cellSize))),
  };
};

export const isValidGridPosition = (gridPos: GridPosition, config: GridConfig): boolean => {
  return gridPos.x >= 0 && gridPos.x < config.width &&
         gridPos.y >= 0 && gridPos.y < config.height;
};

export const isGridPositionOccupied = (tree: TalentTree, gridPos: GridPosition): boolean => {
  return tree.nodes.some(node => node.gridX === gridPos.x && node.gridY === gridPos.y);
};

export const getNodeAt = (tree: TalentTree, gridPos: GridPosition): TalentNode | null => {
  return tree.nodes.find(node => node.gridX === gridPos.x && node.gridY === gridPos.y) || null;
};

export const getAdjacentPositions = (gridPos: GridPosition, config: GridConfig): GridPosition[] => {
  const adjacent: GridPosition[] = [];
  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  directions.forEach(dir => {
    const newPos = { x: gridPos.x + dir.x, y: gridPos.y + dir.y };
    if (isValidGridPosition(newPos, config)) {
      adjacent.push(newPos);
    }
  });

  return adjacent;
};

export const canAddTree = (group: TalentGroup): boolean => {
  return group.trees.length < getGridConfig(group.format).maxTrees;
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
