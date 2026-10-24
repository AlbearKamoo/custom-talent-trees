import { useEffect, useState } from 'react';
import { TalentGroup, EditorMode } from '../types/talent';
import { useTalentGroup } from '../hooks/useTalentGroup';
import EditorToolbar from './EditorToolbar';
import NodeEditor from './NodeEditor';
import TreeSettings from './TreeSettings';
import NewGroupModal from './NewGroupModal';
import TalentTreeCanvas from './TalentTreeCanvas';
import TalentGroupExplorer from './TalentGroupExplorer';
import TreeTabStrip from './TreeTabStrip';
import BackgroundExplorer from './BackgroundExplorer';

interface TalentTreeEditorProps {
  group: TalentGroup;
}

const TalentTreeEditor: React.FC<TalentTreeEditorProps> = ({
  group: initialGroup,
}) => {
  const {
    group,
    selectedTree,
    config,
    editorState,
    canAddTree,
    createNewGroup,
    selectTree,
    addTree,
    removeTree,
    updateTreeMetadata,
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
    showNewGroup,
    startDrag,
    endDrag,
    getValidationErrors,
    exportGroup,
    importGroup,
    startNodeCreation,
    createPendingNode,
    cancelNodeCreation,
    deleteConnection,
    setCtrlHeld,
  } = useTalentGroup(initialGroup);
  const [pickingBackground, setPickingBackground] = useState(false);

  const handleExport = () => {
    const exportedData = exportGroup();
    const dataBlob = new Blob([exportedData], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${group.name.replace(/\s+/g, '-').toLowerCase()}-talent-group.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importGroup(content);
        if (!success) {
          alert('Failed to import talent group');
        }
      } catch (error) {
        console.error('Failed to import:', error);
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const handleRemoveTree = () => {
    if (!selectedTree) return;
    if (group.trees.length <= 1) return;
    if (window.confirm(`Remove tree "${selectedTree.name}" from this group?`)) {
      removeTree(selectedTree.id);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editorState.mode !== EditorMode.EDIT) return;
      const target = e.target as HTMLElement | null;
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
      if (typing) return;
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
      if (e.key === 'Control' || e.key === 'Meta') {
        setCtrlHeld(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setCtrlHeld(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    editorState.mode,
    editorState.selectedNodeId,
    editorState.isConnecting,
    deleteNode,
    cancelConnection,
    selectNode,
    setCtrlHeld,
  ]);

  const selectedNode = selectedTree && editorState.selectedNodeId
    ? selectedTree.nodes.find(n => n.id === editorState.selectedNodeId) || null
    : null;

  return (
    <div className="w-full h-screen bg-talent-background overflow-hidden flex flex-col">
      <EditorToolbar
        mode={editorState.mode}
        format={group.format}
        groupName={group.name}
        treeCount={group.trees.length}
        canAddTree={canAddTree}
        canRemoveTree={group.trees.length > 1}
        onModeChange={setMode}
        onNewGroup={() => showNewGroup(true)}
        onAddTree={addTree}
        onRemoveTree={handleRemoveTree}
        onExport={handleExport}
        onImport={handleImportFile}
        onShowTreeEditor={() => showTreeEditor(true)}
        isConnecting={editorState.isConnecting}
        onCancelConnection={cancelConnection}
        validationErrors={getValidationErrors()}
        isCtrlHeld={editorState.isCtrlHeld}
      />

      {editorState.mode === EditorMode.EXPLORER ? (
        <TalentGroupExplorer
          group={group}
          selectedTreeId={editorState.selectedTreeId}
          onSelectTree={selectTree}
        />
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          <TreeTabStrip
            trees={group.trees}
            selectedTreeId={selectedTree?.id ?? null}
            onSelectTree={selectTree}
            onRenameTree={(treeId, name) => updateTreeMetadata(treeId, { name })}
            onChangeIcon={(treeId, icon) => updateTreeMetadata(treeId, { icon })}
          />

          <div className="flex-1 relative overflow-auto p-8">
            {selectedTree ? (
              <div className="inline-flex flex-col items-stretch">
                <TalentTreeCanvas
                  tree={selectedTree}
                  gridConfig={config}
                  mode={EditorMode.EDIT}
                  selectedNodeId={editorState.selectedNodeId}
                  isConnecting={editorState.isConnecting}
                  isCtrlHeld={editorState.isCtrlHeld}
                  onNodeClick={(nodeId) => selectNode(nodeId)}
                  onStartConnection={startConnection}
                  onCompleteConnection={completeConnection}
                  onStartDrag={startDrag}
                  onDrag={moveNodePosition}
                  onEndDrag={endDrag}
                  onCellClick={startNodeCreation}
                  onConnectionClick={(connectionId) => {
                    if (window.confirm('Are you sure you want to delete this connection?')) {
                      deleteConnection(connectionId);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPickingBackground(true)}
                  className="mt-3 self-center px-3 py-1.5 text-sm rounded border border-gray-600 bg-gray-800 text-gray-200 hover:border-yellow-500 hover:text-yellow-400"
                >
                  Edit Background
                </button>
              </div>
            ) : (
              <div className="text-gray-400">This group has no trees.</div>
            )}
          </div>
        </div>
      )}

      <NodeEditor
        node={selectedNode}
        isOpen={editorState.mode === EditorMode.EDIT && (editorState.showNodeEditor || !!selectedNode)}
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

      <TreeSettings
        tree={selectedTree}
        isOpen={editorState.showTreeEditor}
        onClose={() => showTreeEditor(false)}
        onSave={updateTreeMetadata}
      />

      {pickingBackground && selectedTree && (
        <BackgroundExplorer
          value={selectedTree.backgroundImage}
          onSelect={(background) => {
            updateTreeMetadata(selectedTree.id, {
              backgroundImage: background || undefined,
            });
            setPickingBackground(false);
          }}
          onClose={() => setPickingBackground(false)}
        />
      )}

      <NewGroupModal
        isOpen={editorState.showNewGroup}
        onClose={() => showNewGroup(false)}
        onCreate={(format, name) => createNewGroup(format, name)}
      />

    </div>
  );
};

export default TalentTreeEditor;
