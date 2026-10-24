import { TalentNode, EditorMode, GridConfig } from '../types/talent';
import { gridToPixel } from '../utils/editor-utils';

interface TalentConnectionProps {
  fromNode: TalentNode;
  toNode: TalentNode;
  isActive: boolean;
  gridConfig: GridConfig;
  markerPrefix: string;
  editorMode?: EditorMode;
  connectionId?: string;
  onConnectionClick?: (connectionId: string) => void;
  isCtrlHeld?: boolean;
}

const TalentConnection: React.FC<TalentConnectionProps> = ({
  fromNode,
  toNode,
  isActive,
  gridConfig,
  markerPrefix,
  editorMode = EditorMode.EXPLORER,
  connectionId,
  onConnectionClick,
  isCtrlHeld = false,
}) => {
  const fromPixel = gridToPixel({ x: fromNode.gridX, y: fromNode.gridY }, gridConfig);
  const toPixel = gridToPixel({ x: toNode.gridX, y: toNode.gridY }, gridConfig);

  const getConnectionStyles = () => {
    const baseStyles = isActive
      ? "stroke-talent-connectionActive stroke-2 drop-shadow-sm"
      : "stroke-talent-connection stroke-1 opacity-60";

    if (editorMode === EditorMode.EDIT && connectionId && onConnectionClick && isCtrlHeld) {
      return `${baseStyles} cursor-pointer hover:stroke-red-400 hover:stroke-3 transition-all duration-150`;
    }

    return baseStyles;
  };

  const handleConnectionClick = (e: React.MouseEvent) => {
    if (editorMode === EditorMode.EDIT && connectionId && onConnectionClick && isCtrlHeld) {
      e.preventDefault();
      e.stopPropagation();
      onConnectionClick(connectionId);
    }
  };

  const dx = toPixel.x - fromPixel.x;
  const dy = toPixel.y - fromPixel.y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const unitX = dx / length;
  const unitY = dy / length;

  const nodeRadius = 24;
  const adjustedToX = toPixel.x - unitX * nodeRadius;
  const adjustedToY = toPixel.y - unitY * nodeRadius;

  const markerId = `${markerPrefix}-${isActive ? 'active' : 'inactive'}`;

  return (
    <g>
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

      {editorMode === EditorMode.EDIT && connectionId && onConnectionClick && isCtrlHeld && (
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

      <line
        x1={fromPixel.x}
        y1={fromPixel.y}
        x2={adjustedToX}
        y2={adjustedToY}
        className={getConnectionStyles()}
        strokeLinecap="round"
        markerEnd={`url(#${markerId})`}
        onClick={editorMode === EditorMode.EDIT && isCtrlHeld ? handleConnectionClick : undefined}
        style={editorMode === EditorMode.EDIT && connectionId && onConnectionClick && isCtrlHeld ? { pointerEvents: 'all' } : undefined}
      />
    </g>
  );
};

export default TalentConnection;
