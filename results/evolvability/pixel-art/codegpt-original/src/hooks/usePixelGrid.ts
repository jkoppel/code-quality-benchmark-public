import { useState, useCallback } from "react";
import { PixelGrid, GridPosition, ColorString } from "../types";
import { GridUtility } from "../utils";
import { DEFAULT_COLORS } from "../config/constants";

/**
 * Custom hook for managing pixel grid state
 * Encapsulates all grid-related state management logic
 */
export const usePixelGrid = (initialColor: string = DEFAULT_COLORS.WHITE) => {
  const [pixels, setPixels] = useState<PixelGrid>(() =>
    GridUtility.createEmptyGrid(initialColor)
  );

  /**
   * Sets a pixel at the specified position
   */
  const setPixel = useCallback((position: GridPosition, color: ColorString) => {
    setPixels((currentPixels) =>
      GridUtility.setPixelAt(currentPixels, position, color)
    );
  }, []);

  /**
   * Gets a pixel color at the specified position
   */
  const getPixel = useCallback(
    (position: GridPosition): ColorString => {
      return GridUtility.getPixelAt(pixels, position);
    },
    [pixels]
  );

  /**
   * Clears the entire grid with specified color
   */
  const clearGrid = useCallback((color: string = DEFAULT_COLORS.WHITE) => {
    setPixels(GridUtility.fillGrid(color));
  }, []);

  /**
   * Replaces the entire pixel grid
   */
  const replaceGrid = useCallback((newPixels: PixelGrid) => {
    setPixels(GridUtility.cloneGrid(newPixels));
  }, []);

  /**
   * Fills a specific area with color (flood fill algorithm)
   */
  const floodFill = useCallback(
    (startPosition: GridPosition, newColor: ColorString) => {
      const targetColor = GridUtility.getPixelAt(pixels, startPosition);

      if (targetColor === newColor) return; // No need to fill

      const visited = new Set<string>();
      const stack: GridPosition[] = [startPosition];
      const newPixels = GridUtility.cloneGrid(pixels);

      while (stack.length > 0) {
        const current = stack.pop()!;
        const key = `${current.row},${current.col}`;

        if (visited.has(key) || !GridUtility.isValidGridPosition(current)) {
          continue;
        }

        if (GridUtility.getPixelAt(newPixels, current) !== targetColor) {
          continue;
        }

        visited.add(key);
        newPixels[current.row][current.col] = newColor;

        // Add neighbors to stack
        const neighbors = GridUtility.getNeighbors(current);
        stack.push(...neighbors);
      }

      setPixels(newPixels);
    },
    [pixels]
  );

  return {
    pixels,
    setPixel,
    getPixel,
    clearGrid,
    replaceGrid,
    floodFill,
  };
};
