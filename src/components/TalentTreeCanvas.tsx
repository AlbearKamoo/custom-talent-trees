import {
  TalentTree,
  TalentTreeState,
  TalentState,
  EditorMode,
  GridConfig,
  Position,
} from '../types/talent';
import TalentNode from './TalentNode';
import TalentConnection from './TalentConnection';
import GridCell from './GridCell';
import { getConnectionState } from '../utils/tree-utils';
import { backgroundUrl, treeBackgroundStyle } from '../lib/backgrounds';

interface TalentTreeCanvasProps {
  tree: TalentTree;
  gridConfig: GridConfig;
  mode: EditorMode;
  showLabels?: boolean;
  treeState?: TalentTreeState;
  nodeStates?: Record<string, TalentState>;
  selectedNodeId?: string | null;
  isConnecting?: boolean;
  isCtrlHeld?: boolean;
  onNodeClick?: (nodeId: string, isRightClick?: boolean) => void;
  onNodeHover?: (nodeId: string | null) => void;
  onStartConnection?: (nodeId: string) => void;
  onCompleteConnection?: (nodeId: string) => void;
  onStartDrag?: (nodeId: string) => void;
  onDrag?: (nodeId: string, position: Position) => void;
  onEndDrag?: () => void;
  onCellClick?: (position: Position) => void;
  onConnectionClick?: (connectionId: string) => void;
}

const TalentTreeCanvas: React.FC<TalentTreeCanvasProps> = ({
  tree,
  gridConfig,
  mode,
  showLabels = mode === EditorMode.EDIT,
  treeState,
  nodeStates,
  selectedNodeId = null,
  isConnecting = false,
  isCtrlHeld = false,
  onNodeClick,
  onNodeHover,
  onStartConnection,
  onCompleteConnection,
  onStartDrag,
  onDrag,
  onEndDrag,
  onCellClick,
  onConnectionClick,
}) => {
  const gridWidth = gridConfig.width * gridConfig.cellSize;
  const gridHeight = gridConfig.height * gridConfig.cellSize;
  const occupiedCells = new Set(tree.nodes.map(node => `${node.gridX}-${node.gridY}`));
  const isEdit = mode === EditorMode.EDIT;
  const compact = gridConfig.width === 4;
  const backgroundImage = backgroundUrl(tree.backgroundImage);

  const cellPixel = (x: number, y: number): Position => ({
    x: x * gridConfig.cellSize + gridConfig.cellSize / 2,
    y: y * gridConfig.cellSize + gridConfig.cellSize / 2,
  });

  return (
    <div
      className="relative"
      style={{
        width: gridWidth,
        height: gridHeight,
      }}
    >
      <div
        className="absolute inset-0 z-0 border-2 border-gray-600 rounded-lg pointer-events-none overflow-hidden"
        style={{
          backgroundColor: '#1f2937',
          ...(backgroundImage
            ? treeBackgroundStyle(tree.backgroundImage, compact)
            : {
                backgroundImage: `
                  linear-gradient(to right, rgba(75, 85, 99, 0.3) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(75, 85, 99, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: `${gridConfig.cellSize}px ${gridConfig.cellSize}px`,
              }),
        }}
      />

      {showLabels && (
        <>
          <div className="absolute -left-8 top-0 h-full flex flex-col justify-around text-sm text-gray-400 pointer-events-none">
            {Array.from({ length: gridConfig.height }, (_, i) => (
              <div key={i} className="flex items-center justify-center h-8">
                {i + 1}
              </div>
            ))}
          </div>
          <div className="absolute -top-8 left-0 w-full flex justify-around text-sm text-gray-400 pointer-events-none">
            {Array.from({ length: gridConfig.width }, (_, i) => (
              <div key={i} className="flex items-center justify-center w-8">
                {i + 1}
              </div>
            ))}
          </div>
        </>
      )}

      <svg
        className={`absolute inset-0 ${isCtrlHeld ? 'z-30' : 'pointer-events-none z-10'}`}
        width={gridWidth}
        height={gridHeight}
      >
        {tree.connections.map((connection) => {
          const fromNode = tree.nodes.find(n => n.id === connection.from);
          const toNode = tree.nodes.find(n => n.id === connection.to);
          if (!fromNode || !toNode) return null;

          const isActive = !isEdit && treeState
            ? getConnectionState(connection, treeState)
            : true;

          return (
            <TalentConnection
              key={connection.id}
              fromNode={fromNode}
              toNode={toNode}
              isActive={isActive}
              gridConfig={gridConfig}
              markerPrefix={`${tree.id}-${connection.id}`}
              editorMode={mode}
              connectionId={connection.id}
              isCtrlHeld={isCtrlHeld}
              onConnectionClick={onConnectionClick}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 z-20">
        {isEdit &&
          Array.from({ length: gridConfig.height }, (_, y) =>
            Array.from({ length: gridConfig.width }, (_, x) => {
              const cellKey = `${x}-${y}`;
              if (occupiedCells.has(cellKey)) return null;
              return (
                <GridCell
                  key={cellKey}
                  x={x}
                  y={y}
                  cellSize={gridConfig.cellSize}
                  isOccupied={false}
                  isCtrlHeld={isCtrlHeld}
                  onCellClick={(cellX, cellY) => onCellClick?.(cellPixel(cellX, cellY))}
                  onCellDoubleClick={(cellX, cellY) => onCellClick?.(cellPixel(cellX, cellY))}
                />
              );
            })
          )}

        {tree.nodes.map((node) => (
          <TalentNode
            key={node.id}
            node={node}
            gridConfig={gridConfig}
            state={isEdit ? TalentState.UNLOCKED : (nodeStates?.[node.id] ?? TalentState.LOCKED)}
            currentRanks={isEdit ? 0 : (treeState?.selectedNodes[node.id] || 0)}
            onClick={onNodeClick ?? (() => {})}
            onHover={onNodeHover ?? (() => {})}
            isHovered={!isEdit && treeState?.hoveredNode === node.id}
            editorMode={mode}
            isSelected={selectedNodeId === node.id}
            isConnecting={isConnecting}
            onStartConnection={onStartConnection}
            onCompleteConnection={onCompleteConnection}
            onStartDrag={onStartDrag}
            onDrag={onDrag}
            onEndDrag={onEndDrag}
          />
        ))}
      </div>
    </div>
  );
};

export default TalentTreeCanvas;
