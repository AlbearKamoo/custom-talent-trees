import { TalentNode, TalentTree, TalentState, TalentTreeState } from '../types/talent';

export const calculateTalentState = (
  node: TalentNode,
  treeState: TalentTreeState,
  tree: TalentTree
): TalentState => {
  const currentRanks = treeState.selectedNodes[node.id] || 0;
  
  if (currentRanks >= node.maxRanks) {
    return TalentState.MAXED;
  }
  
  if (currentRanks > 0) {
    return TalentState.SELECTED;
  }
  
  // Check if prerequisites are met
  const prerequisitesMet = node.prerequisites.every(prereqId => {
    const prereqRanks = treeState.selectedNodes[prereqId] || 0;
    const prereqNode = tree.nodes.find(n => n.id === prereqId);
    return prereqNode && prereqRanks > 0;
  });
  
  // Check if point requirements are met (based on gridY position as tier)
  const tierRequirementMet = getTierSpentPoints(node.gridY - 1, treeState, tree) >= node.requiredPoints;
  
  if (prerequisitesMet && tierRequirementMet && treeState.availablePoints > 0) {
    return TalentState.AVAILABLE;
  }
  
  if (prerequisitesMet && tierRequirementMet) {
    return TalentState.UNLOCKED;
  }
  
  return TalentState.LOCKED;
};

export const getTierSpentPoints = (
  tier: number,
  treeState: TalentTreeState,
  tree: TalentTree
): number => {
  return tree.nodes
    .filter(node => node.gridY <= tier)
    .reduce((total, node) => total + (treeState.selectedNodes[node.id] || 0), 0);
};

export const canAllocatePoint = (
  nodeId: string,
  treeState: TalentTreeState,
  tree: TalentTree
): boolean => {
  const node = tree.nodes.find(n => n.id === nodeId);
  if (!node) return false;
  
  const currentRanks = treeState.selectedNodes[nodeId] || 0;
  if (currentRanks >= node.maxRanks) return false;
  
  const state = calculateTalentState(node, treeState, tree);
  return state === TalentState.AVAILABLE;
};

export const canDeallocatePoint = (
  nodeId: string,
  treeState: TalentTreeState,
  tree: TalentTree
): boolean => {
  const node = tree.nodes.find(n => n.id === nodeId);
  if (!node) return false;
  
  const currentRanks = treeState.selectedNodes[nodeId] || 0;
  if (currentRanks === 0) return false;
  
  // Check if any dependent nodes would become invalid
  const dependentNodes = tree.nodes.filter(n => n.prerequisites.includes(nodeId));
  
  for (const dependent of dependentNodes) {
    const dependentRanks = treeState.selectedNodes[dependent.id] || 0;
    if (dependentRanks > 0 && currentRanks === 1) {
      return false; // Can't remove if it would break dependencies
    }
  }
  
  return true;
};

export const allocatePoint = (
  nodeId: string,
  treeState: TalentTreeState,
  tree: TalentTree
): TalentTreeState => {
  if (!canAllocatePoint(nodeId, treeState, tree)) {
    return treeState;
  }
  
  const newSelectedNodes = { ...treeState.selectedNodes };
  newSelectedNodes[nodeId] = (newSelectedNodes[nodeId] || 0) + 1;
  
  return {
    ...treeState,
    selectedNodes: newSelectedNodes,
    availablePoints: treeState.availablePoints - 1,
    spentPoints: treeState.spentPoints + 1,
  };
};

export const deallocatePoint = (
  nodeId: string,
  treeState: TalentTreeState,
  tree: TalentTree
): TalentTreeState => {
  if (!canDeallocatePoint(nodeId, treeState, tree)) {
    return treeState;
  }
  
  const newSelectedNodes = { ...treeState.selectedNodes };
  newSelectedNodes[nodeId] = Math.max(0, (newSelectedNodes[nodeId] || 0) - 1);
  
  if (newSelectedNodes[nodeId] === 0) {
    delete newSelectedNodes[nodeId];
  }
  
  return {
    ...treeState,
    selectedNodes: newSelectedNodes,
    availablePoints: treeState.availablePoints + 1,
    spentPoints: treeState.spentPoints - 1,
  };
};

export const resetTree = (totalPoints: number): TalentTreeState => ({
  selectedNodes: {},
  availablePoints: totalPoints,
  spentPoints: 0,
  hoveredNode: null,
});

export const exportTreeState = (treeState: TalentTreeState, tree: TalentTree) => {
  return {
    treeId: tree.id,
    selectedNodes: treeState.selectedNodes,
    timestamp: new Date().toISOString(),
  };
};

export const importTreeState = (
  exportedState: any,
  _tree: TalentTree,
  totalPoints: number
): TalentTreeState => {
  const spentPoints = Object.values(exportedState.selectedNodes || {})
    .reduce((total: number, ranks: any) => total + (ranks as number), 0);
  
  return {
    selectedNodes: exportedState.selectedNodes || {},
    availablePoints: totalPoints - spentPoints,
    spentPoints,
    hoveredNode: null,
  };
};

export const getConnectionState = (
  connection: { from: string; to: string },
  treeState: TalentTreeState
): boolean => {
  const fromRanks = treeState.selectedNodes[connection.from] || 0;
  const toRanks = treeState.selectedNodes[connection.to] || 0;
  return fromRanks > 0 && toRanks > 0;
}; 