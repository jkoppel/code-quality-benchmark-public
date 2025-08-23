import React from 'react';
import { GRID_SIZE, PIXEL_SIZE } from '../constants';

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onClick: React.MouseEventHandler<HTMLCanvasElement>;
}

const CanvasGrid: React.FC<Props> = ({ canvasRef, onClick }) => (
  <canvas
    ref={canvasRef}
    width={GRID_SIZE * PIXEL_SIZE}
    height={GRID_SIZE * PIXEL_SIZE}
    className="drawing-canvas"
    onClick={onClick}
  />
);

export default CanvasGrid;
