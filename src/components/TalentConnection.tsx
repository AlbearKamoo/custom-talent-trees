import { TalentNode, EditorMode } from '../types/talent';
import { gridToPixel } from '../utils/editor-utils';

interface TalentConnectionProps {
  fromNode: TalentNode;
  toNode: TalentNode;
  isActive: boolean;
  editorMode?: EditorMode;
  connectionId?: string;
  onConnectionClick?: (connectionId: string) => void;
  isShiftHeld?: boolean;
}

const TalentConnection: React.FC<TalentConnectionProps> = ({
  fromNode,
  toNode,
  isActive,
  editorMode = EditorMode.SIMULATE,
  connectionId,
  onConnectionClick,
  isShiftHeld = false,
}) => {
  const fromPixel = gridToPixel({ x: fromNode.gridX, y: fromNode.gridY });
  const toPixel = gridToPixel({ x: toNode.gridX, y: toNode.gridY });

  const getConnectionStyles = () => {
    const baseStyles = isActive 
      ? "stroke-talent-connectionActive stroke-2 drop-shadow-sm"
      : "stroke-talent-connection stroke-1 opacity-60";
    
    // Add interactive styles only when shift is held in edit mode
    if (editorMode === EditorMode.EDIT && connectionId && onConnectionClick && isShiftHeld) {
      return `${baseStyles} cursor-pointer hover:stroke-red-400 hover:stroke-3 transition-all duration-150`;
    }
    
    return baseStyles;
  };

  const handleConnectionClick = (e: React.MouseEvent) => {
    if (editorMode === EditorMode.EDIT && connectionId && onConnectionClick && isShiftHeld) {
      e.preventDefault();
      e.stopPropagation();
      onConnectionClick(connectionId);
    }
  };

  // Calculate the direction vector and normalize it
  const dx = toPixel.x - fromPixel.x;
  const dy = toPixel.y - fromPixel.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const unitX = dx / length;
  const unitY = dy / length;

  // Offset the end point to stop at the edge of the target node (24px radius for node)
  const nodeRadius = 24;
  const adjustedToX = toPixel.x - unitX * nodeRadius;
  const adjustedToY = toPixel.y - unitY * nodeRadius;

  const markerId = `arrowhead-${isActive ? 'active' : 'inactive'}`;

  return (
    <g>
      {/* Define arrowhead marker */}
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0,0 0,6 9,3"
            className={isActive ? "fill-talent-connectionActive" : "fill-talent-connection opacity-60"}
          />
        </marker>
      </defs>
      
      {/* Invisible wider line for easier clicking when shift is held */}
      {editorMode === EditorMode.EDIT && connectionId && onConnectionClick && isShiftHeld && (
        <line
          x1={fromPixel.x}
          y1={fromPixel.y}
          x2={adjustedToX}
          y2={adjustedToY}
          stroke="transparent"
          strokeWidth="12"
          strokeLinecap="round"
          style={{ cursor: 'pointer' }}
          onClick={handleConnectionClick}
        />
      )}
      
      {/* Visible connection line */}
      <line
        x1={fromPixel.x}
        y1={fromPixel.y}
        x2={adjustedToX}
        y2={adjustedToY}
        className={getConnectionStyles()}
        strokeLinecap="round"
        markerEnd={`url(#${markerId})`}
        onClick={editorMode === EditorMode.EDIT && isShiftHeld ? handleConnectionClick : undefined}
        style={editorMode === EditorMode.EDIT && connectionId && onConnectionClick && isShiftHeld ? { pointerEvents: 'all' } : undefined}
      />
    </g>
  );
};

export default TalentConnection; 