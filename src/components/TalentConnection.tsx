import { TalentNode } from '../types/talent';
import { gridToPixel } from '../utils/editor-utils';

interface TalentConnectionProps {
  fromNode: TalentNode;
  toNode: TalentNode;
  isActive: boolean;
}

const TalentConnection: React.FC<TalentConnectionProps> = ({
  fromNode,
  toNode,
  isActive,
}) => {
  const fromPixel = gridToPixel({ x: fromNode.gridX, y: fromNode.gridY });
  const toPixel = gridToPixel({ x: toNode.gridX, y: toNode.gridY });

  const getConnectionStyles = () => {
    return isActive 
      ? "stroke-talent-connectionActive stroke-2 drop-shadow-sm"
      : "stroke-talent-connection stroke-1 opacity-60";
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
      
      <line
        x1={fromPixel.x}
        y1={fromPixel.y}
        x2={adjustedToX}
        y2={adjustedToY}
        className={getConnectionStyles()}
        strokeLinecap="round"
        markerEnd={`url(#${markerId})`}
      />
    </g>
  );
};

export default TalentConnection; 