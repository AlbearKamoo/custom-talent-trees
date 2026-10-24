import { useState, useCallback, useMemo, useEffect } from 'react';
import { TalentTree, TalentTreeState, TalentNode, TalentState } from '../types/talent';
import {
  calculateTalentState,
  allocatePoint,
  deallocatePoint,
  resetTree,
  exportTreeState,
  importTreeState,
  canAllocatePoint,
  canDeallocatePoint,
  treeCapacity,
} from '../utils/tree-utils';

export const useTalentTree = (tree: TalentTree) => {
  const capacity = treeCapacity(tree);

  const [treeState, setTreeState] = useState<TalentTreeState>(() =>
    resetTree(capacity)
  );

  useEffect(() => {
    setTreeState(prev => ({
      ...prev,
      availablePoints: Math.max(0, capacity - prev.spentPoints),
    }));
  }, [capacity]);

  const handleNodeClick = useCallback((nodeId: string, isRightClick: boolean = false) => {
    if (isRightClick) {
      setTreeState(prevState => deallocatePoint(nodeId, prevState, tree));
    } else {
      setTreeState(prevState => allocatePoint(nodeId, prevState, tree));
    }
  }, [tree]);

  const handleNodeHover = useCallback((nodeId: string | null) => {
    setTreeState(prevState => ({
      ...prevState,
      hoveredNode: nodeId,
    }));
  }, []);

  const resetTreeState = useCallback(() => {
    setTreeState(resetTree(capacity));
  }, [capacity]);

  const exportTree = useCallback(() => {
    return exportTreeState(treeState, tree);
  }, [treeState, tree]);

  const importTree = useCallback((exportedState: { selectedNodes?: Record<string, number> }) => {
    setTreeState(importTreeState(exportedState, tree, capacity));
  }, [tree, capacity]);

  const getNodeState = useCallback((node: TalentNode): TalentState => {
    return calculateTalentState(node, treeState, tree);
  }, [treeState, tree]);

  const canAllocate = useCallback((nodeId: string): boolean => {
    return canAllocatePoint(nodeId, treeState, tree);
  }, [treeState, tree]);

  const canDeallocate = useCallback((nodeId: string): boolean => {
    return canDeallocatePoint(nodeId, treeState, tree);
  }, [treeState, tree]);

  const nodeStates = useMemo(() => {
    const states: Record<string, TalentState> = {};
    tree.nodes.forEach(node => {
      states[node.id] = calculateTalentState(node, treeState, tree);
    });
    return states;
  }, [tree.nodes, treeState, tree]);

  return {
    treeState,
    nodeStates,
    capacity,
    handleNodeClick,
    handleNodeHover,
    resetTreeState,
    exportTree,
    importTree,
    getNodeState,
    canAllocate,
    canDeallocate,
  };
};
