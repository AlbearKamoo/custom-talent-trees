import { GridPosition, GridConfig } from '../types/talent';
import GridCell from './GridCell';

interface GridCanvasProps {
  gridConfig: GridConfig;
  onCellClick: (gridPos: GridPosition) => void;
  onCellDoubleClick: (gridPos: GridPosition) => void;
  hoveredCell?: GridPosition | null;
  onCellHover?: (gridPos: GridPosition | null) => void;
  occupiedCells: Set<string>;
}

const GridCanvas: React.FC<GridCanvasProps> = ({
  gridConfig,
  onCellClick,
  onCellDoubleClick,
  occupiedCells,
}) => {
  const totalWidth = gridConfig.width * gridConfig.cellSize;
  const totalHeight = gridConfig.height * gridConfig.cellSize;

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
        backgroundSize: `${gridConfig.cellSize}px ${gridConfig.cellSize}px`,
      }}
    >
      {Array.from({ length: gridConfig.height }, (_, y) =>
        Array.from({ length: gridConfig.width }, (_, x) => {
          const cellKey = getCellKey(x, y);
          const isOccupied = occupiedCells.has(cellKey);

          return (
            <GridCell
              key={cellKey}
              x={x}
              y={y}
              cellSize={gridConfig.cellSize}
              isOccupied={isOccupied}
              onCellClick={handleCellClick}
              onCellDoubleClick={handleCellDoubleClick}
            />
          );
        })
      )}

      <div className="absolute -left-8 top-0 h-full flex flex-col justify-around text-sm text-gray-400">
        {Array.from({ length: gridConfig.height }, (_, i) => (
          <div key={i} className="flex items-center justify-center h-8">
            {i + 1}
          </div>
        ))}
      </div>

      <div className="absolute -top-8 left-0 w-full flex justify-around text-sm text-gray-400">
        {Array.from({ length: gridConfig.width }, (_, i) => (
          <div key={i} className="flex items-center justify-center w-8">
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridCanvas;
