import { TalentNode } from '../types/talent';

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


  const getConnectionStyles = () => {
    return isActive 
      ? "stroke-talent-connectionActive stroke-2 drop-shadow-sm"
      : "stroke-talent-connection stroke-1 opacity-60";
  };

  return (
    <line
      x1={fromNode.x}
      y1={fromNode.y}
      x2={toNode.x}
      y2={toNode.y}
      className={getConnectionStyles()}
      strokeLinecap="round"
    />
  );
};

export default TalentConnection; 