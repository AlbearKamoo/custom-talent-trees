import { EditorMode } from '../types/talent';

interface EditorToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onNewTree: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onShowTreeEditor: () => void;
  isConnecting: boolean;
  onCancelConnection: () => void;
  validationErrors: string[];
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  mode,
  onModeChange,
  onNewTree,
  onExport,
  onImport,
  onShowTreeEditor,
  isConnecting,
  onCancelConnection,
  validationErrors,
}) => {
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Mode Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">Mode:</span>
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => onModeChange(EditorMode.EDIT)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                mode === EditorMode.EDIT
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onModeChange(EditorMode.SIMULATE)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                mode === EditorMode.SIMULATE
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🎮 Simulate
            </button>
          </div>
        </div>

        {/* Edit Mode Tools */}
        {mode === EditorMode.EDIT && (
          <div className="flex items-center space-x-2">
            {isConnecting ? (
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400 text-sm">🔗 Connecting nodes...</span>
                <button
                  onClick={onCancelConnection}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                💡 Click empty cell to add node • Click node + Shift+Click to connect
              </div>
            )}
          </div>
        )}

        {/* Tree Operations */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onNewTree}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            📄 New Tree
          </button>
          
          <button
            onClick={onShowTreeEditor}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
          >
            ⚙️ Tree Settings
          </button>

          <button
            onClick={onExport}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
          >
            💾 Export
          </button>

          <label className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors cursor-pointer">
            📁 Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-3 p-3 bg-red-900 bg-opacity-50 border border-red-600 rounded">
          <div className="text-red-400 font-medium mb-1">⚠️ Validation Errors:</div>
          <ul className="text-red-300 text-sm space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Instructions */}
      {mode === EditorMode.EDIT && (
        <div className="mt-3 p-3 bg-blue-900 bg-opacity-30 border border-blue-600 rounded">
          <div className="text-blue-400 font-medium mb-1">📖 Editor Instructions:</div>
          <div className="text-blue-300 text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>• Click empty cell to create node</div>
            <div>• Click node to select/edit</div>
            <div>• Drag nodes to move them</div>
            <div>• Hold Shift + click two nodes to connect</div>
            <div>• Right-click connection to delete</div>
            <div>• Delete key removes selected node</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorToolbar; 