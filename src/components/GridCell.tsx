import { GRID_CONFIG } from '../utils/editor-utils';

interface GridCellProps {
  x: number;
  y: number;
  isOccupied: boolean;
  onCellClick: (x: number, y: number) => void;
  onCellDoubleClick: (x: number, y: number) => void;
  isCtrlHeld?: boolean;
}

const GridCell: React.FC<GridCellProps> = ({
  x,
  y,
  isOccupied,
  onCellClick,
  onCellDoubleClick,
  isCtrlHeld = false,
}) => {
  const getCellClassName = () => {
    const baseClasses = "absolute border border-transparent transition-all duration-150 group";
    
    if (isOccupied) {
      return `${baseClasses} bg-blue-500 bg-opacity-20 border-blue-400 pointer-events-none`;
    }
    
    // Disable pointer events when ctrl is held to allow clicks to pass through to connections
    if (isCtrlHeld) {
      return `${baseClasses} pointer-events-none`;
    }
    
    return `${baseClasses} hover:bg-yellow-500 hover:bg-opacity-20 hover:border-yellow-400 cursor-pointer`;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`GridCell click: ${x}, ${y}, occupied: ${isOccupied}`);
    if (!isOccupied) {
      onCellClick(x, y);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOccupied) {
      onCellDoubleClick(x, y);
    }
  };

  return (
    <div
      className={getCellClassName()}
      style={{
        left: x * GRID_CONFIG.cellSize,
        top: y * GRID_CONFIG.cellSize,
        width: GRID_CONFIG.cellSize,
        height: GRID_CONFIG.cellSize,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Plus sign for empty cells on hover - using CSS group-hover */}
      {!isOccupied && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div className="w-8 h-8 bg-yellow-400 bg-opacity-20 rounded-full flex items-center justify-center">
            <div className="text-2xl text-yellow-400 font-bold">+</div>
          </div>
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