import React from "react";
import { GridPosition } from "../../types";
import { CANVAS_CONFIG } from "../../config/constants";
import { GridUtility } from "../../utils";
import "./DrawingCanvas.css";

interface DrawingCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onCanvasClick: (position: GridPosition | null) => void;
  className?: string;
}

/**
 * DrawingCanvas component following Single Responsibility Principle
 * Handles canvas rendering and click events
 */
export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  canvasRef,
  onCanvasClick,
  className = "",
}) => {
  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const gridPos = GridUtility.canvasToGrid(canvasPos);

    if (GridUtility.isValidGridPosition(gridPos)) {
      onCanvasClick(gridPos);
    } else {
      onCanvasClick(null);
    }
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className={`drawing-canvas ${className}`}
        role="img"
        aria-label="Pixel art drawing canvas"
        width={CANVAS_CONFIG.gridSize * CANVAS_CONFIG.pixelSize}
        height={CANVAS_CONFIG.gridSize * CANVAS_CONFIG.pixelSize}
      />
    </div>
  );
};
