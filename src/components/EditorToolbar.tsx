import { EditorMode, GridFormat } from '../types/talent';
import { GRID_FORMATS } from '../utils/editor-utils';

interface EditorToolbarProps {
  mode: EditorMode;
  format: GridFormat;
  groupName: string;
  treeCount: number;
  canAddTree: boolean;
  canRemoveTree: boolean;
  onModeChange: (mode: EditorMode) => void;
  onNewGroup: () => void;
  onAddTree: () => void;
  onRemoveTree: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onShowTreeEditor: () => void;
  isConnecting: boolean;
  onCancelConnection: () => void;
  validationErrors: string[];
  isCtrlHeld?: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  mode,
  format,
  groupName,
  treeCount,
  canAddTree,
  canRemoveTree,
  onModeChange,
  onNewGroup,
  onAddTree,
  onRemoveTree,
  onExport,
  onImport,
  onShowTreeEditor,
  isConnecting,
  onCancelConnection,
  validationErrors,
  isCtrlHeld = false,
}) => {
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = '';
    }
  };

  const config = GRID_FORMATS[format];

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div>
            <div className="text-sm font-semibold text-yellow-400">{groupName}</div>
            <div className="text-xs text-gray-400">
              {format === 'compact' ? 'Compact' : 'Large'} {config.width}×{config.height} · {treeCount}/{config.maxTrees} trees
            </div>
          </div>
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => onModeChange(EditorMode.EDIT)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                mode === EditorMode.EDIT
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => onModeChange(EditorMode.EXPLORER)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                mode === EditorMode.EXPLORER
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Explorer
            </button>
          </div>
        </div>

        {mode === EditorMode.EXPLORER && (
          <div className="text-sm text-gray-400">
            Left click to allocate · Right click to deallocate · Each tree has its own point pool
          </div>
        )}

        {mode === EditorMode.EDIT && (
          <div className="flex items-center space-x-2">
            {isConnecting ? (
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400 text-sm">Connecting nodes...</span>
                <button
                  onClick={onCancelConnection}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : isCtrlHeld ? (
              <span className="text-red-400 text-sm">Connection deletion mode — click connections to delete</span>
            ) : (
              <div className="text-sm text-gray-400">
                Click empty cell to add node · Shift+click nodes to connect · Ctrl/Cmd+click connection to delete
              </div>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={onNewGroup}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            New Group
          </button>

          {mode === EditorMode.EDIT && (
            <>
              <button
                onClick={onAddTree}
                disabled={!canAddTree}
                title={canAddTree ? 'Add a tree to this group' : `This ${format} group is at its maximum of ${config.maxTrees} trees`}
                className="px-3 py-2 bg-blue-800 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
              >
                Add Tree
              </button>
              <button
                onClick={onRemoveTree}
                disabled={!canRemoveTree}
                title={canRemoveTree ? 'Remove the selected tree' : 'A group must keep at least one tree'}
                className="px-3 py-2 bg-red-800 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
              >
                Remove Tree
              </button>
            </>
          )}

          <button
            onClick={onShowTreeEditor}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
          >
            Tree Settings
          </button>

          <button
            onClick={onExport}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
          >
            Export
          </button>

          <label className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors cursor-pointer">
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="mt-3 p-3 bg-red-900 bg-opacity-50 border border-red-600 rounded">
          <div className="text-red-400 font-medium mb-1">Validation Errors:</div>
          <ul className="text-red-300 text-sm space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EditorToolbar;
