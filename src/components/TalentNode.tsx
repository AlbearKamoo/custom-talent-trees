import { TalentNode as TalentNodeType, TalentState, EditorMode } from '../types/talent';

interface TalentNodeProps {
  node: TalentNodeType;
  state: TalentState;
  currentRanks: number;
  onClick: (nodeId: string, isRightClick?: boolean) => void;
  onHover: (nodeId: string | null) => void;
  isHovered: boolean;
  // Editor props
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
  onClick,
  onHover,
  isHovered,
  editorMode = EditorMode.SIMULATE,
  isSelected = false,
  isConnecting = false,
  onStartConnection,
  onCompleteConnection,
  onStartDrag,
  onDrag,
  onEndDrag,
}) => {
  const getNodeStyles = () => {
    const baseStyles = "relative w-12 h-12 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center justify-center";
    
    // Editor mode styling
    if (editorMode === EditorMode.EDIT) {
      let editStyles = `${baseStyles} bg-gray-700 border-gray-500 hover:border-yellow-500`;
      
      if (isSelected) {
        editStyles += " border-yellow-500 shadow-talent";
      }
      
      if (isConnecting) {
        editStyles += " border-blue-500 shadow-lg";
      }
      
      return editStyles;
    }
    
    // Simulation mode styling
    switch (state) {
      case TalentState.LOCKED:
        return `${baseStyles} bg-talent-locked border-talent-border opacity-50`;
      case TalentState.AVAILABLE:
        return `${baseStyles} bg-talent-available border-talent-available shadow-talent hover:shadow-talent-hover`;
      case TalentState.UNLOCKED:
        return `${baseStyles} bg-talent-unlocked border-talent-unlocked`;
      case TalentState.SELECTED:
        return `${baseStyles} bg-talent-selected border-talent-selected shadow-talent`;
      case TalentState.MAXED:
        return `${baseStyles} bg-talent-selected border-talent-selected shadow-talent-hover`;
      default:
        return `${baseStyles} bg-talent-locked border-talent-border`;
    }
  };

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
    if (editorMode === EditorMode.SIMULATE) {
      onClick(node.id, true);
    }
  };

  const handleMouseEnter = () => {
    onHover(node.id);
  };

  const handleMouseLeave = () => {
    onHover(null);
  };

  // Drag functionality for editor mode
  const handleMouseDown = (e: React.MouseEvent) => {
    if (editorMode === EditorMode.EDIT && onStartDrag && !isConnecting) {
      onStartDrag(node.id);
      
      const startX = e.clientX;
      const startY = e.clientY;
      const startNodeX = node.x;
      const startNodeY = node.y;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        
        if (onDrag) {
          onDrag(node.id, {
            x: startNodeX + deltaX,
            y: startNodeY + deltaY,
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

  return (
    <div
      className="absolute"
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className={getNodeStyles()}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        title={`${node.name} (${currentRanks}/${node.maxRanks})`}
      >
        {/* Icon placeholder - in a real app, you'd use actual icons */}
        <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-xs font-bold">
          {node.icon || node.name.charAt(0)}
        </div>
        
        {/* Rank indicator */}
        {node.maxRanks > 1 && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
            {currentRanks}
          </div>
        )}
        
        {/* Hover tooltip */}
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