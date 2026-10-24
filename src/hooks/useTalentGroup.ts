import { useState, useCallback, useMemo } from 'react';
import {
  TalentGroup,
  TalentTree,
  EditorState,
  EditorMode,
  Position,
  NodeTemplate,
  GridFormat,
} from '../types/talent';
import {
  createEmptyTree,
  createEmptyGroup,
  createNode,
  addNodeToTree,
  removeNodeFromTree,
  updateNode,
  moveNode,
  addConnectionToTree,
  removeConnection,
  validateGroup,
  exportGroupAsJSON,
  importGroupFromJSON,
  pixelToGrid,
  isGridPositionOccupied,
  getGridConfig,
  canAddTree,
} from '../utils/editor-utils';

const initialEditorState = (selectedTreeId: string | null): EditorState => ({
  mode: EditorMode.EDIT,
  selectedTreeId,
  selectedNodeId: null,
  isConnecting: false,
  connectionStart: null,
  draggedNode: null,
  showNodeEditor: false,
  showTreeEditor: false,
  showNewGroup: false,
  pendingNodePosition: null,
  isCtrlHeld: false,
});

export const useTalentGroup = (initialGroup: TalentGroup) => {
  const [group, setGroup] = useState<TalentGroup>(initialGroup);

  const [editorState, setEditorState] = useState<EditorState>(() =>
    initialEditorState(initialGroup.trees[0]?.id ?? null)
  );

  const config = getGridConfig(group.format);

  const selectedTree = useMemo(() => {
    return (
      group.trees.find(tree => tree.id === editorState.selectedTreeId) ??
      group.trees[0] ??
      null
    );
  }, [group.trees, editorState.selectedTreeId]);

  const updateTreeById = useCallback((treeId: string, updater: (tree: TalentTree) => TalentTree) => {
    setGroup(prev => ({
      ...prev,
      trees: prev.trees.map(tree => (tree.id === treeId ? updater(tree) : tree)),
    }));
  }, []);

  const createNewGroup = useCallback((format: GridFormat, name?: string) => {
    const next = createEmptyGroup(format, name);
    setGroup(next);
    setEditorState(initialEditorState(next.trees[0].id));
  }, []);

  const updateGroupMetadata = useCallback((updates: Partial<Pick<TalentGroup, 'name'>>) => {
    setGroup(prev => ({ ...prev, ...updates }));
  }, []);

  const selectTree = useCallback((treeId: string) => {
    setEditorState(prev => ({
      ...prev,
      selectedTreeId: treeId,
      selectedNodeId: null,
      isConnecting: false,
      connectionStart: null,
      pendingNodePosition: null,
      showNodeEditor: false,
    }));
  }, []);

  const addTree = useCallback(() => {
    if (!canAddTree(group)) return;
    const tree = createEmptyTree({
      name: `New Talent Tree ${group.trees.length + 1}`,
    });
    setGroup({ ...group, trees: [...group.trees, tree] });
    setEditorState(state => ({
      ...state,
      selectedTreeId: tree.id,
      selectedNodeId: null,
    }));
  }, [group]);

  const removeTree = useCallback((treeId: string) => {
    if (group.trees.length <= 1) return;
    const trees = group.trees.filter(tree => tree.id !== treeId);
    if (trees.length === group.trees.length) return;
    setGroup({ ...group, trees });
    setEditorState(state => ({
      ...state,
      selectedTreeId: state.selectedTreeId === treeId ? trees[0].id : state.selectedTreeId,
      selectedNodeId: null,
    }));
  }, [group]);

  const updateTreeMetadata = useCallback((treeId: string, updates: Partial<TalentTree>) => {
    updateTreeById(treeId, tree => ({ ...tree, ...updates }));
  }, [updateTreeById]);

  const addNode = useCallback((position: Position, template?: NodeTemplate) => {
    if (!selectedTree) return null;
    const gridPos = pixelToGrid(position, config);
    if (isGridPositionOccupied(selectedTree, gridPos)) {
      return null;
    }
    const newNode = createNode(gridPos, template);
    updateTreeById(selectedTree.id, tree => addNodeToTree(tree, newNode));
    setEditorState(prev => ({ ...prev, selectedNodeId: newNode.id }));
    return newNode.id;
  }, [selectedTree, config, updateTreeById]);

  const deleteNode = useCallback((nodeId: string) => {
    if (!selectedTree) return;
    updateTreeById(selectedTree.id, tree => removeNodeFromTree(tree, nodeId));
    setEditorState(prev => ({
      ...prev,
      selectedNodeId: prev.selectedNodeId === nodeId ? null : prev.selectedNodeId,
    }));
  }, [selectedTree, updateTreeById]);

  const updateNodeData = useCallback((nodeId: string, updates: Partial<TalentTree['nodes'][number]>) => {
    if (!selectedTree) return;
    updateTreeById(selectedTree.id, tree => updateNode(tree, nodeId, updates));
  }, [selectedTree, updateTreeById]);

  const moveNodePosition = useCallback((nodeId: string, newPosition: Position) => {
    if (!selectedTree) return;
    const gridPos = pixelToGrid(newPosition, config);
    const existingNode = selectedTree.nodes.find(n => n.gridX === gridPos.x && n.gridY === gridPos.y);
    if (existingNode && existingNode.id !== nodeId) {
      return;
    }
    updateTreeById(selectedTree.id, tree => moveNode(tree, nodeId, gridPos));
  }, [selectedTree, config, updateTreeById]);

  const startConnection = useCallback((nodeId: string) => {
    setEditorState(prev => ({
      ...prev,
      isConnecting: true,
      connectionStart: nodeId,
    }));
  }, []);

  const completeConnection = useCallback((toNodeId: string) => {
    if (!selectedTree) return;
    if (editorState.connectionStart && editorState.connectionStart !== toNodeId) {
      updateTreeById(selectedTree.id, tree =>
        addConnectionToTree(tree, editorState.connectionStart!, toNodeId)
      );
    }
    setEditorState(prev => ({
      ...prev,
      isConnecting: false,
      connectionStart: null,
    }));
  }, [editorState.connectionStart, selectedTree, updateTreeById]);

  const cancelConnection = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      isConnecting: false,
      connectionStart: null,
    }));
  }, []);

  const deleteConnection = useCallback((connectionId: string) => {
    if (!selectedTree) return;
    updateTreeById(selectedTree.id, tree => removeConnection(tree, connectionId));
  }, [selectedTree, updateTreeById]);

  const setMode = useCallback((mode: EditorMode) => {
    setEditorState(prev => ({
      ...prev,
      mode,
      selectedNodeId: null,
      isConnecting: false,
      connectionStart: null,
      pendingNodePosition: null,
      showNodeEditor: false,
    }));
  }, []);

  const selectNode = useCallback((nodeId: string | null) => {
    setEditorState(prev => ({ ...prev, selectedNodeId: nodeId }));
  }, []);

  const showNodeEditor = useCallback((show: boolean) => {
    setEditorState(prev => ({ ...prev, showNodeEditor: show }));
  }, []);

  const showTreeEditor = useCallback((show: boolean) => {
    setEditorState(prev => ({ ...prev, showTreeEditor: show }));
  }, []);

  const showNewGroup = useCallback((show: boolean) => {
    setEditorState(prev => ({ ...prev, showNewGroup: show }));
  }, []);

  const startDrag = useCallback((nodeId: string) => {
    setEditorState(prev => ({ ...prev, draggedNode: nodeId }));
  }, []);

  const endDrag = useCallback(() => {
    setEditorState(prev => ({ ...prev, draggedNode: null }));
  }, []);

  const getValidationErrors = useCallback(() => {
    return validateGroup(group);
  }, [group]);

  const exportGroup = useCallback(() => {
    return exportGroupAsJSON(group);
  }, [group]);

  const importGroup = useCallback((jsonString: string) => {
    try {
      const imported = importGroupFromJSON(jsonString);
      setGroup(imported);
      setEditorState(initialEditorState(imported.trees[0]?.id ?? null));
      return true;
    } catch (error) {
      console.error('Failed to import group:', error);
      return false;
    }
  }, []);

  const startNodeCreation = useCallback((position: Position) => {
    if (!selectedTree || editorState.mode !== EditorMode.EDIT) return;
    const gridPos = pixelToGrid(position, config);
    if (isGridPositionOccupied(selectedTree, gridPos)) {
      return;
    }
    setEditorState(prev => ({
      ...prev,
      pendingNodePosition: gridPos,
      showNodeEditor: true,
      selectedNodeId: null,
    }));
  }, [editorState.mode, selectedTree, config]);

  const createPendingNode = useCallback((nodeData: NodeTemplate) => {
    if (!selectedTree || !editorState.pendingNodePosition) return null;
    const newNode = createNode(editorState.pendingNodePosition, nodeData);
    updateTreeById(selectedTree.id, tree => addNodeToTree(tree, newNode));
    setEditorState(prev => ({
      ...prev,
      pendingNodePosition: null,
      selectedNodeId: newNode.id,
      showNodeEditor: false,
    }));
    return newNode.id;
  }, [editorState.pendingNodePosition, selectedTree, updateTreeById]);

  const cancelNodeCreation = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      pendingNodePosition: null,
      showNodeEditor: false,
    }));
  }, []);

  const setCtrlHeld = useCallback((isHeld: boolean) => {
    setEditorState(prev => ({ ...prev, isCtrlHeld: isHeld }));
  }, []);

  return {
    group,
    selectedTree,
    config,
    editorState,
    canAddTree: canAddTree(group),

    createNewGroup,
    updateGroupMetadata,
    selectTree,
    addTree,
    removeTree,
    updateTreeMetadata,

    addNode,
    deleteNode,
    updateNodeData,
    moveNodePosition,

    startConnection,
    completeConnection,
    cancelConnection,
    deleteConnection,

    setMode,
    selectNode,
    showNodeEditor,
    showTreeEditor,
    showNewGroup,

    startDrag,
    endDrag,

    getValidationErrors,
    exportGroup,
    importGroup,

    startNodeCreation,
    createPendingNode,
    cancelNodeCreation,
    setCtrlHeld,
  };
};
