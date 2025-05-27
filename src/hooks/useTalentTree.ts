import { useState, useCallback, useMemo } from 'react';
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
} from '../utils/tree-utils';

export const useTalentTree = (tree: TalentTree, initialPoints: number = 51) => {
  const [treeState, setTreeState] = useState<TalentTreeState>(() => 
    resetTree(initialPoints)
  );

  const handleNodeClick = useCallback((nodeId: string, isRightClick: boolean = false) => {
    if (isRightClick) {
      // Right click to deallocate
      setTreeState(prevState => deallocatePoint(nodeId, prevState, tree));
    } else {
      // Left click to allocate
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
    setTreeState(resetTree(initialPoints));
  }, [initialPoints]);

  const exportTree = useCallback(() => {
    return exportTreeState(treeState, tree);
  }, [treeState, tree]);

  const importTree = useCallback((exportedState: any) => {
    setTreeState(importTreeState(exportedState, tree, initialPoints));
  }, [tree, initialPoints]);

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