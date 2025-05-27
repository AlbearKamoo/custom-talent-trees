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

  return (
    <line
      x1={fromPixel.x}
      y1={fromPixel.y}
      x2={toPixel.x}
      y2={toPixel.y}
      className={getConnectionStyles()}
      strokeLinecap="round"
    />
  );
};

export default TalentConnection; 