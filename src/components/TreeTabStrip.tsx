import { useEffect, useRef, useState } from 'react';
import { TalentTree } from '../types/talent';
import TalentIcon from './TalentIcon';
import IconPicker from './IconPicker';

interface TreeTabStripProps {
  trees: TalentTree[];
  selectedTreeId: string | null;
  onSelectTree: (treeId: string) => void;
  onRenameTree: (treeId: string, name: string) => void;
  onChangeIcon: (treeId: string, icon: string) => void;
}

const PencilIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13L2.25 21.75l.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"
    />
  </svg>
);

const TreeTabStrip: React.FC<TreeTabStripProps> = ({
  trees,
  selectedTreeId,
  onSelectTree,
  onRenameTree,
  onChangeIcon,
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [pickingIconId, setPickingIconId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [renamingId]);

  const commitRename = () => {
    if (!renamingId) return;
    const next = renameValue.trim();
    if (next) {
      onRenameTree(renamingId, next);
    }
    setRenamingId(null);
  };

  const pickingTree = trees.find(tree => tree.id === pickingIconId) ?? null;

  return (
    <>
      <div className="flex border-b border-gray-700 bg-gray-950" role="tablist">
        {trees.map((tree) => {
          const active = tree.id === selectedTreeId;
          const renaming = renamingId === tree.id;

          return (
            <div
              key={tree.id}
              role="tab"
              aria-selected={active}
              className={`group flex items-center gap-2 px-3 py-2 border-b-2 min-w-0 ${
                active
                  ? 'border-yellow-500 bg-gray-800 text-yellow-400'
                  : 'border-transparent text-gray-300 hover:bg-gray-900'
              }`}
              onClick={() => {
                if (!renaming) onSelectTree(tree.id);
              }}
            >
              <button
                type="button"
                title="Change tree icon"
                aria-label={`Change icon for ${tree.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTree(tree.id);
                  setPickingIconId(tree.id);
                }}
                className="flex-shrink-0 rounded border border-transparent hover:border-yellow-500 focus:border-yellow-500 focus:outline-none"
              >
                <TalentIcon icon={tree.icon} name={tree.name} size={24} />
              </button>

              {renaming ? (
                <input
                  ref={inputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitRename();
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setRenamingId(null);
                    }
                  }}
                  className="min-w-0 w-36 px-1.5 py-0.5 bg-gray-700 border border-yellow-500 rounded text-sm text-white font-semibold focus:outline-none"
                />
              ) : (
                <>
                  <span className="truncate font-semibold">{tree.name}</span>
                  <button
                    type="button"
                    title="Rename tree"
                    aria-label={`Rename ${tree.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTree(tree.id);
                      setRenameValue(tree.name);
                      setRenamingId(tree.id);
                    }}
                    className={`flex-shrink-0 p-1 rounded text-gray-400 hover:text-yellow-400 hover:bg-gray-700 ${
                      active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <PencilIcon />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {pickingTree && (
        <IconPicker
          value={pickingTree.icon}
          onSelect={(icon) => {
            onChangeIcon(pickingTree.id, icon);
            setPickingIconId(null);
          }}
          onClose={() => setPickingIconId(null)}
        />
      )}
    </>
  );
};

export default TreeTabStrip;
