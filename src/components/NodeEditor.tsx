import { useState, useEffect } from 'react';
import { TalentNode } from '../types/talent';

interface NodeEditorProps {
  node: TalentNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, updates: Partial<TalentNode>) => void;
  onDelete: (nodeId: string) => void;
  onCreateNew?: (nodeData: any) => void; // For creating new nodes
  isCreatingNew?: boolean; // Whether we're creating a new node
}

const NodeEditor: React.FC<NodeEditorProps> = ({
  node,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onCreateNew,
  isCreatingNew = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    maxRanks: 1,
    requiredPoints: 0,
  });

  useEffect(() => {
    if (node) {
      setFormData({
        name: node.name,
        description: node.description,
        icon: node.icon,
        maxRanks: node.maxRanks,
        requiredPoints: node.requiredPoints,
      });
    } else if (isCreatingNew) {
      // Reset to default values for new node
      setFormData({
        name: 'New Talent',
        description: 'A new talent ability',
        icon: '⭐',
        maxRanks: 1,
        requiredPoints: 0,
      });
    }
  }, [node, isCreatingNew]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingNew && onCreateNew) {
      onCreateNew(formData);
      onClose();
    } else if (node) {
      onSave(node.id, formData);
      onClose();
    }
  };

  const handleDelete = () => {
    if (node && window.confirm('Are you sure you want to delete this node?')) {
      onDelete(node.id);
      onClose();
    }
  };

  const iconOptions = ['⚔️', '🛡️', '💥', '⭐', '🔥', '❄️', '⚡', '🌟', '💎', '🎯', '🏹', '🗡️'];

  if (!isOpen || (!node && !isCreatingNew)) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-yellow-400">
            {isCreatingNew ? 'Create New Node' : 'Edit Node'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2 mb-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`p-2 text-xl border rounded ${
                    formData.icon === icon
                      ? 'border-yellow-500 bg-yellow-500 bg-opacity-20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Or enter custom icon/emoji"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Max Ranks
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxRanks}
                onChange={(e) => setFormData(prev => ({ ...prev, maxRanks: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Required Points
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.requiredPoints}
                onChange={(e) => setFormData(prev => ({ ...prev, requiredPoints: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            {!isCreatingNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Delete Node
              </button>
            )}
            
            <div className={`space-x-2 ${isCreatingNew ? 'w-full flex justify-end' : ''}`}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
              >
                {isCreatingNew ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NodeEditor; 