import { TalentNode, TalentTree, TalentConnection, Position, NodeTemplate, TreeMetadata } from '../types/talent';

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
  position: Position,
  template?: NodeTemplate
): TalentNode => {
  const id = generateNodeId();
  return {
    id,
    name: template?.name || 'New Talent',
    description: template?.description || 'A new talent ability',
    icon: template?.icon || '⭐',
    tier: calculateTierFromY(position.y),
    position: 0, // Will be calculated based on tier
    maxRanks: template?.maxRanks || 1,
    currentRanks: 0,
    requiredPoints: template?.requiredPoints || 0,
    prerequisites: [],
    connections: [],
    x: position.x,
    y: position.y,
  };
};

export const calculateTierFromY = (y: number): number => {
  // Assuming tiers are spaced 100px apart starting at y=100
  return Math.max(1, Math.floor((y - 50) / 100) + 1);
};

export const addNodeToTree = (tree: TalentTree, node: TalentNode): TalentTree => {
  // Update position within tier
  const nodesInTier = tree.nodes.filter(n => n.tier === node.tier);
  const updatedNode = { ...node, position: nodesInTier.length };
  
  return {
    ...tree,
    nodes: [...tree.nodes, updatedNode],
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

export const moveNode = (tree: TalentTree, nodeId: string, newPosition: Position): TalentTree => {
  const newTier = calculateTierFromY(newPosition.y);
  return updateNode(tree, nodeId, {
    x: newPosition.x,
    y: newPosition.y,
    tier: newTier,
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