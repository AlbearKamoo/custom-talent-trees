import { GRID_CONFIG } from '../utils/editor-utils';

interface GridCellProps {
  x: number;
  y: number;
  isOccupied: boolean;
  isHovered: boolean;
  onCellClick: (x: number, y: number) => void;
  onCellDoubleClick: (x: number, y: number) => void;
  onCellMouseEnter: (x: number, y: number) => void;
  onCellMouseLeave: () => void;
}

const GridCell: React.FC<GridCellProps> = ({
  x,
  y,
  isOccupied,
  isHovered,
  onCellClick,
  onCellDoubleClick,
  onCellMouseEnter,
  onCellMouseLeave,
}) => {
  const cellKey = `${x}-${y}`;

  const getCellClassName = () => {
    const baseClasses = "absolute border border-transparent transition-all duration-150";
    
    if (isOccupied) {
      return `${baseClasses} bg-blue-500 bg-opacity-20 border-blue-400 pointer-events-none`;
    }
    
    if (isHovered) {
      return `${baseClasses} bg-yellow-500 bg-opacity-20 border-yellow-400 cursor-pointer pointer-events-auto`;
    }
    
    return `${baseClasses} hover:bg-gray-600 hover:bg-opacity-30 cursor-pointer pointer-events-auto`;
  };

  const handleClick = () => {
    if (!isOccupied) {
      onCellClick(x, y);
    }
  };

  const handleDoubleClick = () => {
    if (!isOccupied) {
      onCellDoubleClick(x, y);
    }
  };

  const handleMouseEnter = () => {
    if (!isOccupied) {
      onCellMouseEnter(x, y);
    }
  };

  const handleMouseLeave = () => {
    if (!isOccupied) {
      onCellMouseLeave();
    }
  };

  return (
    <div
      key={cellKey}
      className={getCellClassName()}
      style={{
        left: x * GRID_CONFIG.cellSize,
        top: y * GRID_CONFIG.cellSize,
        width: GRID_CONFIG.cellSize,
        height: GRID_CONFIG.cellSize,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Plus sign for empty cells on hover */}
      {!isOccupied && isHovered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-4xl text-yellow-400 opacity-70 font-light">+</div>
        </div>
      )}
      
      {/* Grid coordinates (for debugging) - uncomment if needed */}
      {/* <div className="absolute top-1 left-1 text-xs text-gray-400 pointer-events-none">
        {x},{y}
      </div> */}
    </div>
  );
};

export default GridCell; 