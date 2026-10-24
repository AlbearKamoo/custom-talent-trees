import { useState } from 'react';
import { GridFormat } from '../types/talent';
import { GRID_FORMATS } from '../utils/editor-utils';

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (format: GridFormat, name: string) => void;
}

const NewGroupModal: React.FC<NewGroupModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('New Talent Group');
  const [format, setFormat] = useState<GridFormat>('compact');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(format, name.trim() || 'New Talent Group');
    setName('New Talent Group');
    setFormat('compact');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-yellow-400">New Talent Group</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        <p className="text-sm text-gray-400">
          Creating a new group replaces the current one. Format cannot be changed later.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-300 mb-1">Grid format</legend>
          {(['compact', 'large'] as GridFormat[]).map((option) => {
            const config = GRID_FORMATS[option];
            return (
              <label
                key={option}
                className={`flex items-start gap-3 p-3 rounded border cursor-pointer ${
                  format === option ? 'border-yellow-500 bg-gray-700' : 'border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  checked={format === option}
                  onChange={() => setFormat(option)}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-white capitalize">{option}</div>
                  <div className="text-sm text-gray-400">
                    {config.width}×{config.height} grid, up to {config.maxTrees} trees
                    {option === 'compact' ? ', all shown in Explorer' : ', one shown at a time'}
                  </div>
                </div>
              </label>
            );
          })}
        </fieldset>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
          >
            Create group
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewGroupModal;
