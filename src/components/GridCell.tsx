interface GridCellProps {
  x: number;
  y: number;
  cellSize: number;
  isOccupied: boolean;
  onCellClick: (x: number, y: number) => void;
  onCellDoubleClick: (x: number, y: number) => void;
  isCtrlHeld?: boolean;
}

const GridCell: React.FC<GridCellProps> = ({
  x,
  y,
  cellSize,
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

    if (isCtrlHeld) {
      return `${baseClasses} pointer-events-none`;
    }

    return `${baseClasses} hover:bg-yellow-500 hover:bg-opacity-20 hover:border-yellow-400 cursor-pointer`;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
        left: x * cellSize,
        top: y * cellSize,
        width: cellSize,
        height: cellSize,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {!isOccupied && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div className="w-8 h-8 bg-yellow-400 bg-opacity-20 rounded-full flex items-center justify-center">
            <div className="text-2xl text-yellow-400 font-bold">+</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridCell;
