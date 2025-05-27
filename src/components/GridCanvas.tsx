import { GridPosition } from '../types/talent';
import { GRID_CONFIG } from '../utils/editor-utils';
import GridCell from './GridCell';

interface GridCanvasProps {
  onCellClick: (gridPos: GridPosition) => void;
  onCellDoubleClick: (gridPos: GridPosition) => void;
  hoveredCell?: GridPosition | null;
  onCellHover?: (gridPos: GridPosition | null) => void;
  occupiedCells: Set<string>;
}

const GridCanvas: React.FC<GridCanvasProps> = ({
  onCellClick,
  onCellDoubleClick,
  occupiedCells,
}) => {
  const totalWidth = GRID_CONFIG.width * GRID_CONFIG.cellSize;
  const totalHeight = GRID_CONFIG.height * GRID_CONFIG.cellSize;

  const handleCellClick = (gridX: number, gridY: number) => {
    onCellClick({ x: gridX, y: gridY });
  };

  const handleCellDoubleClick = (gridX: number, gridY: number) => {
    onCellDoubleClick({ x: gridX, y: gridY });
  };



  const getCellKey = (x: number, y: number) => `${x}-${y}`;

  return (
    <div 
      className="relative bg-gray-800 border-2 border-gray-600 rounded-lg pointer-events-none"
      style={{ 
        width: totalWidth, 
        height: totalHeight,
        backgroundImage: `
          linear-gradient(to right, rgba(75, 85, 99, 0.3) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(75, 85, 99, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_CONFIG.cellSize}px ${GRID_CONFIG.cellSize}px`,
      }}
    >
      {/* Grid cells */}
      {Array.from({ length: GRID_CONFIG.height }, (_, y) =>
        Array.from({ length: GRID_CONFIG.width }, (_, x) => {
          const cellKey = getCellKey(x, y);
          const isOccupied = occupiedCells.has(cellKey);
          
          return (
            <GridCell
              key={cellKey}
              x={x}
              y={y}
              isOccupied={isOccupied}
              onCellClick={handleCellClick}
              onCellDoubleClick={handleCellDoubleClick}
            />
          );
        })
      )}
      
      {/* Row and column labels */}
      <div className="absolute -left-8 top-0 h-full flex flex-col justify-around text-sm text-gray-400">
        {Array.from({ length: GRID_CONFIG.height }, (_, i) => (
          <div key={i} className="flex items-center justify-center h-8">
            {i + 1}
          </div>
        ))}
      </div>
      
      <div className="absolute -top-8 left-0 w-full flex justify-around text-sm text-gray-400">
        {Array.from({ length: GRID_CONFIG.width }, (_, i) => (
          <div key={i} className="flex items-center justify-center w-8">
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridCanvas; 