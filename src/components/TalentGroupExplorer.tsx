import { TalentGroup, EditorMode } from '../types/talent';
import { getGridConfig } from '../utils/editor-utils';
import { useTalentTree } from '../hooks/useTalentTree';
import TalentTreeCanvas from './TalentTreeCanvas';
import TreeHeader from './TreeHeader';
import TalentIcon from './TalentIcon';

interface TalentGroupExplorerProps {
  group: TalentGroup;
  selectedTreeId: string | null;
  onSelectTree: (treeId: string) => void;
}

const ExplorerTreePanel: React.FC<{
  tree: TalentGroup['trees'][number];
  gridConfig: ReturnType<typeof getGridConfig>;
}> = ({ tree, gridConfig }) => {
  const { treeState, nodeStates, capacity, handleNodeClick, handleNodeHover, resetTreeState } =
    useTalentTree(tree);

  return (
    <div className="flex flex-col">
      <TreeHeader
        name={tree.name}
        icon={tree.icon}
        spent={treeState.spentPoints}
        capacity={capacity}
        onReset={resetTreeState}
      />
      <div className="p-4 bg-black/40">
        <TalentTreeCanvas
          tree={tree}
          gridConfig={gridConfig}
          mode={EditorMode.EXPLORER}
          showLabels={false}
          treeState={treeState}
          nodeStates={nodeStates}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
        />
      </div>
    </div>
  );
};

const TalentGroupExplorer: React.FC<TalentGroupExplorerProps> = ({
  group,
  selectedTreeId,
  onSelectTree,
}) => {
  const gridConfig = getGridConfig(group.format);
  const isCompact = group.format === 'compact';
  const activeId = selectedTreeId ?? group.trees[0]?.id;

  if (isCompact) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-nowrap justify-center gap-4 min-w-min">
          {group.trees.map((tree) => (
            <div
              key={tree.id}
              className="overflow-hidden rounded-lg border border-gray-700 shadow-lg"
            >
              <ExplorerTreePanel tree={tree} gridConfig={gridConfig} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex border-b border-gray-700 bg-gray-950">
        {group.trees.map((tree) => {
          const active = tree.id === activeId;
          return (
            <button
              key={tree.id}
              type="button"
              onClick={() => onSelectTree(tree.id)}
              className={`flex-1 min-w-0 flex items-center gap-2 px-3 py-2 border-b-2 ${
                active
                  ? 'border-yellow-500 bg-gray-800 text-yellow-400'
                  : 'border-transparent text-gray-300 hover:bg-gray-900'
              }`}
            >
              <TalentIcon icon={tree.icon} name={tree.name} size={24} />
              <span className="truncate font-semibold">{tree.name}</span>
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
        {group.trees.map((tree) => (
          <div
            key={tree.id}
            className={`overflow-hidden rounded-lg border border-gray-700 shadow-lg ${
              tree.id === activeId ? '' : 'hidden'
            }`}
          >
            <ExplorerTreePanel tree={tree} gridConfig={gridConfig} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TalentGroupExplorer;
