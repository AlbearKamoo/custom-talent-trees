import { useEffect, useState } from 'react';
import { TalentTree } from '../types/talent';
import { isCatalogIcon } from '../lib/icons';
import IconPicker from './IconPicker';
import TalentIcon from './TalentIcon';

interface TreeSettingsProps {
  tree: TalentTree | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (treeId: string, updates: Partial<TalentTree>) => void;
}

const TreeSettings: React.FC<TreeSettingsProps> = ({
  tree,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '⭐',
  });
  const [pickingIcon, setPickingIcon] = useState(false);

  useEffect(() => {
    if (tree) {
      setFormData({
        name: tree.name,
        description: tree.description,
        icon: tree.icon || '⭐',
      });
    }
  }, [tree]);

  if (!isOpen || !tree) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(tree.id, {
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-yellow-400">Tree Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Icon</label>
            <div className="flex items-center gap-3">
              <TalentIcon icon={formData.icon} name={formData.name} size={48} />
              <button
                type="button"
                onClick={() => setPickingIcon(true)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white hover:border-yellow-500"
              >
                Choose icon
              </button>
            </div>
            <p className="mt-1 truncate text-xs text-gray-400">
              {isCatalogIcon(formData.icon) ? formData.icon : 'No catalog icon selected'}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              Save
            </button>
          </div>
        </form>
      </div>
      {pickingIcon && (
        <IconPicker
          value={formData.icon}
          onSelect={(icon) => {
            setFormData((prev) => ({ ...prev, icon }));
            setPickingIcon(false);
          }}
          onClose={() => setPickingIcon(false)}
        />
      )}
    </div>
  );
};

export default TreeSettings;
