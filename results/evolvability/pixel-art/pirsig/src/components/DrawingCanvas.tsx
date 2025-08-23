import React, { forwardRef } from 'react';
import { GRID_SIZE, PIXEL_SIZE } from '../constants';

interface DrawingCanvasProps {
  onClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

const DrawingCanvas = forwardRef<HTMLCanvasElement, DrawingCanvasProps>(
  ({ onClick }, ref) => {
    return (
      <canvas
        ref={ref}
        width={GRID_SIZE * PIXEL_SIZE}
        height={GRID_SIZE * PIXEL_SIZE}
        onClick={onClick}
        className="drawing-canvas"
      />
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;