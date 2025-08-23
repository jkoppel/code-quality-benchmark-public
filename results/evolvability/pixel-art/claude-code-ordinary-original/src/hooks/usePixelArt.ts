import { useState, useCallback } from 'react';
import { PixelGrid, Color, GridPosition } from '../types';
import { GRID_SIZE, DEFAULT_PIXEL_COLOR, DEFAULT_COLOR } from '../constants';
import { colorToRgbString, isValidGridPosition } from '../utils/canvasUtils';

const createInitialGrid = (): PixelGrid => {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(DEFAULT_PIXEL_COLOR));
};

export const usePixelArt = () => {
  const [selectedColor, setSelectedColor] = useState<Color>(DEFAULT_COLOR);
  const [pixels, setPixels] = useState<PixelGrid>(createInitialGrid);

  const updatePixel = useCallback(
    (position: GridPosition) => {
      if (!isValidGridPosition(position)) return;

      setPixels((prevPixels) => {
        const newPixels = [...prevPixels];
        newPixels[position.row][position.col] = colorToRgbString(selectedColor);
        return newPixels;
      });
    },
    [selectedColor]
  );

  const updateColor = useCallback((color: Partial<Color>) => {
    setSelectedColor((prevColor) => ({ ...prevColor, ...color }));
  }, []);

  const resetGrid = useCallback(() => {
    setPixels(createInitialGrid());
  }, []);

  const loadPixels = useCallback((newPixels: PixelGrid) => {
    setPixels(newPixels);
  }, []);

  return {
    pixels,
    selectedColor,
    updatePixel,
    updateColor,
    setSelectedColor,
    resetGrid,
    loadPixels
  };
};