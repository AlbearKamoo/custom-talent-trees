import { TalentNode as TalentNodeType, TalentState, EditorMode, GridConfig } from '../types/talent';
import { gridToPixel } from '../utils/editor-utils';
import TalentIcon from './TalentIcon';

const NODE_CLIP =
  'polygon(12.5% 0, 87.5% 0, 100% 12.5%, 100% 87.5%, 87.5% 100%, 12.5% 100%, 0 87.5%, 0 12.5%)';

const FRAME = {
  green: '/talent-nodes/square-green.webp',
  yellow: '/talent-nodes/square-yellow.webp',
  gray: '/talent-nodes/square-gray.webp',
} as const;

interface TalentNodeProps {
  node: TalentNodeType;
  state: TalentState;
  currentRanks: number;
  gridConfig: GridConfig;
  onClick: (nodeId: string, isRightClick?: boolean) => void;
  onHover: (nodeId: string | null) => void;
  isHovered: boolean;
  editorMode?: EditorMode;
  isSelected?: boolean;
  isConnecting?: boolean;
  onStartConnection?: (nodeId: string) => void;
  onCompleteConnection?: (nodeId: string) => void;
  onStartDrag?: (nodeId: string) => void;
  onDrag?: (nodeId: string, position: { x: number; y: number }) => void;
  onEndDrag?: () => void;
}

const TalentNode: React.FC<TalentNodeProps> = ({
  node,
  state,
  currentRanks,
  gridConfig,
  onClick,
  onHover,
  isHovered,
  editorMode = EditorMode.EXPLORER,
  isSelected = false,
  isConnecting = false,
  onStartConnection,
  onCompleteConnection,
  onStartDrag,
  onDrag,
  onEndDrag,
}) => {
  const frameSrc = (() => {
    if (editorMode === EditorMode.EDIT) {
      if (isConnecting) return FRAME.yellow;
      if (isSelected) return FRAME.yellow;
      return FRAME.gray;
    }
    if (state === TalentState.SELECTED || state === TalentState.MAXED) return FRAME.yellow;
    if (state === TalentState.AVAILABLE || state === TalentState.UNLOCKED) return FRAME.green;
    return FRAME.gray;
  })();

  const locked = editorMode !== EditorMode.EDIT && state === TalentState.LOCKED;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (editorMode === EditorMode.EDIT) {
      if (e.shiftKey && onStartConnection && !isConnecting) {
        onStartConnection(node.id);
      } else if (isConnecting && onCompleteConnection) {
        onCompleteConnection(node.id);
      } else {
        onClick(node.id, false);
      }
    } else {
      onClick(node.id, e.button === 2);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (editorMode === EditorMode.EXPLORER) {
      onClick(node.id, true);
    }
  };

  const handleMouseEnter = () => {
    onHover(node.id);
  };

  const handleMouseLeave = () => {
    onHover(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editorMode === EditorMode.EDIT && onStartDrag && !isConnecting) {
      onStartDrag(node.id);

      const startX = e.clientX;
      const startY = e.clientY;
      const startPixelPos = gridToPixel({ x: node.gridX, y: node.gridY }, gridConfig);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        if (onDrag) {
          onDrag(node.id, {
            x: startPixelPos.x + deltaX,
            y: startPixelPos.y + deltaY,
          });
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        if (onEndDrag) {
          onEndDrag();
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const pixelPosition = gridToPixel({ x: node.gridX, y: node.gridY }, gridConfig);

  return (
    <div
      className="absolute"
      style={{
        left: `${pixelPosition.x}px`,
        top: `${pixelPosition.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        role="button"
        aria-label={node.name}
        className="relative h-12 w-12 cursor-pointer"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        title={`${node.name} (${currentRanks}/${node.maxRanks})`}
      >
        <div
          className={`absolute inset-[3px] overflow-hidden bg-black ${locked ? 'grayscale opacity-70' : ''}`}
          style={{ clipPath: NODE_CLIP }}
        >
          <TalentIcon icon={node.icon} name={node.name} size={42} className="rounded-none h-full w-full object-cover" />
        </div>
        <img
          src={frameSrc}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        {editorMode !== EditorMode.EDIT && node.maxRanks > 1 && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
            {currentRanks}
          </div>
        )}

        {isHovered && (
          <div className="absolute z-50 bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg min-w-64 max-w-80 -top-2 left-full ml-2">
            <div className="font-bold text-yellow-400 mb-1">{node.name}</div>
            <div className="text-sm text-gray-300 mb-2">{node.description}</div>
            <div className="text-xs text-gray-400">
              <div>Ranks: {currentRanks}/{node.maxRanks}</div>
              <div>Required Points: {node.requiredPoints}</div>
              {node.prerequisites.length > 0 && (
                <div>Prerequisites: {node.prerequisites.join(', ')}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentNode;
