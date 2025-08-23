import { useState, useCallback } from "react";
import { PixelGrid, RGBColor, GridPosition } from "../types";
import { DEFAULT_CANVAS_CONFIG, WHITE_COLOR } from "../config/constants";
import { rgbToString } from "../utils/colorUtils";
import { validateGridPosition } from "../utils/coordinateUtils";

/**
 * Custom hook for managing pixel grid state and operations
 * Follows Single Responsibility Principle - only manages grid state
 */
export const usePixelGrid = (
  initialGridSize: number = DEFAULT_CANVAS_CONFIG.gridSize
) => {
  // Initialize grid with white pixels
  const [pixels, setPixels] = useState<PixelGrid>(() =>
    Array(initialGridSize)
      .fill(null)
      .map(() => Array(initialGridSize).fill(rgbToString(WHITE_COLOR)))
  );

  const [history, setHistory] = useState<PixelGrid[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  /**
   * Set a pixel at the specified position
   */
  const setPixel = useCallback(
    (position: GridPosition, color: RGBColor) => {
      const validation = validateGridPosition(position, pixels.length);
      if (!validation.isValid) {
        console.warn("Invalid grid position:", validation.errors);
        return;
      }

      setPixels((prevPixels) => {
        // Save current state to history before making changes
        const newHistory = [...history.slice(0, historyIndex + 1), prevPixels];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        const newPixels = prevPixels.map((row) => [...row]);
        newPixels[position.row][position.col] = rgbToString(color);
        return newPixels;
      });
    },
    [pixels.length, history, historyIndex]
  );

  /**
   * Clear the entire grid
   */
  const clearGrid = useCallback(() => {
    const newPixels = Array(pixels.length)
      .fill(null)
      .map(() => Array(pixels.length).fill(rgbToString(WHITE_COLOR)));

    // Save current state to history
    const newHistory = [...history.slice(0, historyIndex + 1), pixels];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setPixels(newPixels);
  }, [pixels, history, historyIndex]);

  /**
   * Load a new pixel grid
   */
  const loadGrid = useCallback(
    (newPixels: PixelGrid) => {
      // Save current state to history
      const newHistory = [...history.slice(0, historyIndex + 1), pixels];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      setPixels(newPixels);
    },
    [pixels, history, historyIndex]
  );

  /**
   * Undo the last action
   */
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPixels(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  /**
   * Redo the next action
   */
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPixels(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  /**
   * Fill an area with a color (flood fill algorithm)
   */
  const floodFill = useCallback(
    (startPosition: GridPosition, newColor: RGBColor) => {
      const validation = validateGridPosition(startPosition, pixels.length);
      if (!validation.isValid) {
        console.warn("Invalid grid position:", validation.errors);
        return;
      }

      const targetColor = pixels[startPosition.row][startPosition.col];
      const fillColor = rgbToString(newColor);

      if (targetColor === fillColor) {
        return; // No need to fill with the same color
      }

      setPixels((prevPixels) => {
        // Save current state to history
        const newHistory = [...history.slice(0, historyIndex + 1), prevPixels];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        const newPixels = prevPixels.map((row) => [...row]);
        const stack: GridPosition[] = [startPosition];

        while (stack.length > 0) {
          const { row, col } = stack.pop()!;

          if (
            row < 0 ||
            row >= newPixels.length ||
            col < 0 ||
            col >= newPixels[0].length
          ) {
            continue;
          }

          if (newPixels[row][col] !== targetColor) {
            continue;
          }

          newPixels[row][col] = fillColor;

          // Add adjacent pixels to stack
          stack.push(
            { row: row - 1, col },
            { row: row + 1, col },
            { row, col: col - 1 },
            { row, col: col + 1 }
          );
        }

        return newPixels;
      });
    },
    [pixels, history, historyIndex]
  );

  /**
   * Get pixel color at position
   */
  const getPixel = useCallback(
    (position: GridPosition): string | null => {
      const validation = validateGridPosition(position, pixels.length);
      if (!validation.isValid) {
        return null;
      }
      return pixels[position.row][position.col];
    },
    [pixels]
  );

  /**
   * Check if undo is available
   */
  const canUndo = historyIndex > 0;

  /**
   * Check if redo is available
   */
  const canRedo = historyIndex < history.length - 1;

  /**
   * Get grid dimensions
   */
  const gridSize = pixels.length;

  return {
    pixels,
    setPixel,
    clearGrid,
    loadGrid,
    undo,
    redo,
    floodFill,
    getPixel,
    canUndo,
    canRedo,
    gridSize,
  };
};
