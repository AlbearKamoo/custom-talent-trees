import { useState, useCallback } from 'react';
import { TalentTree, EditorState, EditorMode, Position, NodeTemplate } from '../types/talent';
import {
  createEmptyTree,
  createNode,
  addNodeToTree,
  removeNodeFromTree,
  updateNode,
  moveNode,
  addConnectionToTree,
  removeConnection,
  validateTree,
  exportTreeAsJSON,
  importTreeFromJSON,
} from '../utils/editor-utils';

export const useTalentTreeEditor = (initialTree?: TalentTree) => {
  const [tree, setTree] = useState<TalentTree>(
    initialTree || createEmptyTree()
  );
  
  const [editorState, setEditorState] = useState<EditorState>({
    mode: EditorMode.EDIT,
    selectedNodeId: null,
    isConnecting: false,
    connectionStart: null,
    draggedNode: null,
    showNodeEditor: false,
    showTreeEditor: false,
  });

  // Tree operations
  const createNewTree = useCallback((name?: string, description?: string) => {
    const newTree = createEmptyTree({ name, description });
    setTree(newTree);
    setEditorState(prev => ({ ...prev, selectedNodeId: null }));
  }, []);

  const updateTreeMetadata = useCallback((updates: Partial<TalentTree>) => {
    setTree(prev => ({ ...prev, ...updates }));
  }, []);

  // Node operations
  const addNode = useCallback((position: Position, template?: NodeTemplate) => {
    const newNode = createNode(position, template);
    setTree(prev => addNodeToTree(prev, newNode));
    setEditorState(prev => ({ ...prev, selectedNodeId: newNode.id }));
    return newNode.id;
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setTree(prev => removeNodeFromTree(prev, nodeId));
    setEditorState(prev => ({ 
      ...prev, 
      selectedNodeId: prev.selectedNodeId === nodeId ? null : prev.selectedNodeId 
    }));
  }, []);

  const updateNodeData = useCallback((nodeId: string, updates: Partial<any>) => {
    setTree(prev => updateNode(prev, nodeId, updates));
  }, []);

  const moveNodePosition = useCallback((nodeId: string, newPosition: Position) => {
    setTree(prev => moveNode(prev, nodeId, newPosition));
  }, []);

  // Connection operations
  const startConnection = useCallback((nodeId: string) => {
    setEditorState(prev => ({
      ...prev,
      isConnecting: true,
      connectionStart: nodeId,
    }));
  }, []);

  const completeConnection = useCallback((toNodeId: string) => {
    if (editorState.connectionStart && editorState.connectionStart !== toNodeId) {
      setTree(prev => addConnectionToTree(prev, editorState.connectionStart!, toNodeId));
    }
    setEditorState(prev => ({
      ...prev,
      isConnecting: false,
      connectionStart: null,
    }));
  }, [editorState.connectionStart]);

  const cancelConnection = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      isConnecting: false,
      connectionStart: null,
    }));
  }, []);

  const deleteConnection = useCallback((connectionId: string) => {
    setTree(prev => removeConnection(prev, connectionId));
  }, []);

  // Editor state management
  const setMode = useCallback((mode: EditorMode) => {
    setEditorState(prev => ({ ...prev, mode }));
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

  // Drag and drop
  const startDrag = useCallback((nodeId: string) => {
    setEditorState(prev => ({ ...prev, draggedNode: nodeId }));
  }, []);

  const endDrag = useCallback(() => {
    setEditorState(prev => ({ ...prev, draggedNode: null }));
  }, []);

  // Validation and export
  const getValidationErrors = useCallback(() => {
    return validateTree(tree);
  }, [tree]);

  const exportTree = useCallback(() => {
    return exportTreeAsJSON(tree);
  }, [tree]);

  const importTree = useCallback((jsonString: string) => {
    try {
      const importedTree = importTreeFromJSON(jsonString);
      setTree(importedTree);
      setEditorState(prev => ({ ...prev, selectedNodeId: null }));
      return true;
    } catch (error) {
      console.error('Failed to import tree:', error);
      return false;
    }
  }, []);

  // Canvas operations
  const handleCanvasClick = useCallback((_position: Position) => {
    if (editorState.mode === EditorMode.EDIT) {
      if (editorState.isConnecting) {
        cancelConnection();
      } else {
        // Deselect current node
        selectNode(null);
      }
    }
  }, [editorState.mode, editorState.isConnecting, cancelConnection, selectNode]);

  const handleCanvasDoubleClick = useCallback((position: Position) => {
    if (editorState.mode === EditorMode.EDIT) {
      addNode(position);
    }
  }, [editorState.mode, addNode]);

  return {
    // State
    tree,
    editorState,
    
    // Tree operations
    createNewTree,
    updateTreeMetadata,
    
    // Node operations
    addNode,
    deleteNode,
    updateNodeData,
    moveNodePosition,
    
    // Connection operations
    startConnection,
    completeConnection,
    cancelConnection,
    deleteConnection,
    
    // Editor state
    setMode,
    selectNode,
    showNodeEditor,
    showTreeEditor,
    
    // Drag and drop
    startDrag,
    endDrag,
    
    // Validation and export
    getValidationErrors,
    exportTree,
    importTree,
    
    // Canvas operations
    handleCanvasClick,
    handleCanvasDoubleClick,
  };
}; 