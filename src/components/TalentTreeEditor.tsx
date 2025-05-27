import { useEffect } from 'react';
import { TalentTree, EditorMode } from '../types/talent';
import { useTalentTree } from '../hooks/useTalentTree';
import { useTalentTreeEditor } from '../hooks/useTalentTreeEditor';
import TalentNode from './TalentNode';
import TalentConnection from './TalentConnection';
import EditorToolbar from './EditorToolbar';
import NodeEditor from './NodeEditor';

import GridCell from './GridCell';
import { getConnectionState } from '../utils/tree-utils';
import { GRID_CONFIG } from '../utils/editor-utils';

interface TalentTreeEditorProps {
  tree: TalentTree;
  initialPoints?: number;
}

const TalentTreeEditor: React.FC<TalentTreeEditorProps> = ({
  tree: initialTree,
  initialPoints = 51,
}) => {
  // Editor functionality
  const {
    tree,
    editorState,
    createNewTree,
    deleteNode,
    updateNodeData,
    moveNodePosition,
    startConnection,
    completeConnection,
    cancelConnection,
    setMode,
    selectNode,
    showNodeEditor,
    showTreeEditor,
    startDrag,
    endDrag,
    getValidationErrors,
    exportTree: exportEditorTree,
    importTree: importEditorTree,

    startNodeCreation,
    createPendingNode,
    cancelNodeCreation,
  } = useTalentTreeEditor(initialTree);

  // Simulation functionality (only used in simulate mode)
  const {
    treeState,
    nodeStates,
    handleNodeClick,
    handleNodeHover,
    resetTreeState,
    exportTree: exportSimulationTree,
    importTree: importSimulationTree,
  } = useTalentTree(tree, initialPoints);

  const handleExport = () => {
    if (editorState.mode === EditorMode.EDIT) {
      // Export tree structure
      const exportedData = exportEditorTree();
      const dataBlob = new Blob([exportedData], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tree.name}-talent-tree.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Export talent build
      const exportedData = exportSimulationTree();
      const dataStr = JSON.stringify(exportedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tree.name}-talent-build.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (editorState.mode === EditorMode.EDIT) {
          // Import tree structure
          const success = importEditorTree(content);
          if (!success) {
            alert('Failed to import tree structure');
          }
        } else {
          // Import talent build
          const importedData = JSON.parse(content);
          importSimulationTree(importedData);
        }
      } catch (error) {
        console.error('Failed to import:', error);
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  // Grid state - no longer needed with new architecture
  
  // Calculate occupied cells
  const occupiedCells = new Set(
    tree.nodes.map(node => `${node.gridX}-${node.gridY}`)
  );

  // Grid dimensions
  const gridWidth = GRID_CONFIG.width * GRID_CONFIG.cellSize;
  const gridHeight = GRID_CONFIG.height * GRID_CONFIG.cellSize;

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    if (editorState.mode === EditorMode.EDIT) {
      if (e.key === 'Delete' && editorState.selectedNodeId) {
        deleteNode(editorState.selectedNodeId);
      }
      if (e.key === 'Escape') {
        if (editorState.isConnecting) {
          cancelConnection();
        } else {
          selectNode(null);
        }
      }
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editorState.mode, editorState.selectedNodeId, editorState.isConnecting]);

  const selectedNode = editorState.selectedNodeId 
    ? tree.nodes.find(n => n.id === editorState.selectedNodeId) || null
    : null;

  return (
    <div className="w-full h-screen bg-talent-background overflow-hidden flex flex-col">
      {/* Toolbar */}
      <EditorToolbar
        mode={editorState.mode}
        onModeChange={setMode}
        onNewTree={() => createNewTree()}
        onExport={handleExport}
        onImport={handleImportFile}
        onShowTreeEditor={() => showTreeEditor(true)}
        isConnecting={editorState.isConnecting}
        onCancelConnection={cancelConnection}
        validationErrors={getValidationErrors()}
      />

      {/* Header - only show in simulate mode */}
      {editorState.mode === EditorMode.SIMULATE && (
        <div className="bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-yellow-400">{tree.name}</h1>
              <p className="text-gray-300">{tree.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-lg font-semibold text-green-400">
                  Available Points: {treeState.availablePoints}
                </div>
                <div className="text-sm text-gray-400">
                  Spent: {treeState.spentPoints} / {treeState.availablePoints + treeState.spentPoints}
                </div>
              </div>
              <button
                onClick={resetTreeState}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Reset Points
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Talent Tree Canvas */}
      <div className="flex-1 relative overflow-auto p-8">
        <div 
          className="relative"
          style={{
            width: gridWidth,
            height: gridHeight,
          }}
        >
          {/* Background grid visual (lines, numbering) */}
          <div 
            className="absolute inset-0 z-0 bg-gray-800 border-2 border-gray-600 rounded-lg pointer-events-none"
            style={{ 
              backgroundImage: `
                linear-gradient(to right, rgba(75, 85, 99, 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(75, 85, 99, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_CONFIG.cellSize}px ${GRID_CONFIG.cellSize}px`,
            }}
          >
            {/* Row and column labels */}
            <div className="absolute -left-8 top-0 h-full flex flex-col justify-around text-sm text-gray-400">
              {Array.from({ length: GRID_CONFIG.height }, (_, i) => (
                <div key={i} className="flex items-center justify-center h-8">
                  {i + 1}
                </div>
              ))}
            </div>
            
            <div className="absolute -top-8 left-0 w-full flex justify-around text-sm text-gray-400">
              {Array.from({ length: GRID_CONFIG.width }, (_, i) => (
                <div key={i} className="flex items-center justify-center w-8">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* SVG for connections */}
          <svg
            className="absolute inset-0 pointer-events-none z-10"
            width={gridWidth}
            height={gridHeight}
          >
            {tree.connections.map((connection) => {
              const fromNode = tree.nodes.find(n => n.id === connection.from);
              const toNode = tree.nodes.find(n => n.id === connection.to);
              
              if (!fromNode || !toNode) return null;
              
              const isActive = editorState.mode === EditorMode.SIMULATE 
                ? getConnectionState(connection, treeState)
                : true;
              
              return (
                <TalentConnection
                  key={connection.id}
                  fromNode={fromNode}
                  toNode={toNode}
                  isActive={isActive}
                />
              );
            })}
          </svg>

          {/* Interactive layer: Grid cells + Talent nodes */}
          <div className="absolute inset-0 z-20">
            {/* Grid cells for empty spaces (edit mode only) */}
            {editorState.mode === EditorMode.EDIT && 
              Array.from({ length: GRID_CONFIG.height }, (_, y) =>
                Array.from({ length: GRID_CONFIG.width }, (_, x) => {
                  const cellKey = `${x}-${y}`;
                  const isOccupied = occupiedCells.has(cellKey);
                  
                  // Only render empty cells
                  if (isOccupied) return null;
                  
                  return (
                    <GridCell
                      key={cellKey}
                      x={x}
                      y={y}
                      isOccupied={false}
                      onCellClick={(cellX: number, cellY: number) => {
                        const pixelPos = { 
                          x: cellX * GRID_CONFIG.cellSize + GRID_CONFIG.cellSize / 2, 
                          y: cellY * GRID_CONFIG.cellSize + GRID_CONFIG.cellSize / 2 
                        };
                        startNodeCreation(pixelPos);
                      }}
                      onCellDoubleClick={(cellX: number, cellY: number) => {
                        const pixelPos = { 
                          x: cellX * GRID_CONFIG.cellSize + GRID_CONFIG.cellSize / 2, 
                          y: cellY * GRID_CONFIG.cellSize + GRID_CONFIG.cellSize / 2 
                        };
                        startNodeCreation(pixelPos);
                      }}
                    />
                  );
                })
              )
            }

            {/* Talent nodes */}
            {tree.nodes.map((node) => (
              <TalentNode
                key={node.id}
                node={node}
                state={editorState.mode === EditorMode.SIMULATE ? nodeStates[node.id] : 'unlocked' as any}
                currentRanks={editorState.mode === EditorMode.SIMULATE ? (treeState.selectedNodes[node.id] || 0) : 0}
                onClick={editorState.mode === EditorMode.SIMULATE ? handleNodeClick : () => selectNode(node.id)}
                onHover={editorState.mode === EditorMode.SIMULATE ? handleNodeHover : () => {}}
                isHovered={editorState.mode === EditorMode.SIMULATE ? treeState.hoveredNode === node.id : false}
                editorMode={editorState.mode}
                isSelected={editorState.selectedNodeId === node.id}
                isConnecting={editorState.isConnecting}
                onStartConnection={startConnection}
                onCompleteConnection={completeConnection}
                onStartDrag={startDrag}
                onDrag={moveNodePosition}
                onEndDrag={endDrag}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Node Editor Modal */}
      <NodeEditor
        node={selectedNode}
        isOpen={editorState.showNodeEditor || (editorState.mode === EditorMode.EDIT && !!selectedNode)}
        isCreatingNew={!!editorState.pendingNodePosition}
        onClose={() => {
          if (editorState.pendingNodePosition) {
            cancelNodeCreation();
          } else {
            showNodeEditor(false);
            selectNode(null);
          }
        }}
        onSave={updateNodeData}
        onDelete={deleteNode}
        onCreateNew={createPendingNode}
      />

      {/* Instructions - only show in simulate mode */}
      {editorState.mode === EditorMode.SIMULATE && (
        <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-600 rounded-lg p-4 max-w-sm">
          <h3 className="font-bold text-yellow-400 mb-2">Instructions</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Left click to allocate points</li>
            <li>• Right click to deallocate points</li>
            <li>• Hover for talent details</li>
            <li>• Export/Import builds as JSON</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TalentTreeEditor; 