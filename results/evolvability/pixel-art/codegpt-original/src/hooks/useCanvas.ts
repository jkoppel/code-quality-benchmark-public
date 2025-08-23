import { useRef, useEffect, useCallback } from "react";
import { CanvasService } from "../services/CanvasService";
import { PixelGrid, CanvasConfig, GridPosition, Coordinates } from "../types";
import { DEFAULT_CANVAS_CONFIG } from "../config/constants";
import { canvasToGrid } from "../utils/coordinateUtils";

/**
 * Custom hook for managing canvas operations
 * Follows Single Responsibility Principle - only manages canvas interactions
 */
export const useCanvas = (config: CanvasConfig = DEFAULT_CANVAS_CONFIG) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasServiceRef = useRef<CanvasService | null>(null);

  /**
   * Initialize canvas service
   */
  useEffect(() => {
    if (canvasRef.current && !canvasServiceRef.current) {
      canvasServiceRef.current = new CanvasService(config);
      try {
        canvasServiceRef.current.initialize(canvasRef.current);
      } catch (error) {
        console.error("Failed to initialize canvas:", error);
      }
    }
  }, [config]);

  /**
   * Update canvas configuration
   */
  const updateConfig = useCallback((newConfig: Partial<CanvasConfig>) => {
    if (canvasServiceRef.current) {
      canvasServiceRef.current.updateConfig(newConfig);
    }
  }, []);

  /**
   * Render pixel grid to canvas
   */
  const renderGrid = useCallback((pixels: PixelGrid) => {
    if (canvasServiceRef.current) {
      try {
        canvasServiceRef.current.renderGrid(pixels);
      } catch (error) {
        console.error("Failed to render grid:", error);
      }
    }
  }, []);

  /**
   * Handle canvas click events
   */
  const handleCanvasClick = useCallback(
    (
      event: React.MouseEvent<HTMLCanvasElement>,
      onPixelClick: (position: GridPosition) => void
    ) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const coordinates: Coordinates = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const gridPosition = canvasToGrid(coordinates, config.pixelSize);

      // Validate position is within bounds
      if (
        gridPosition.row >= 0 &&
        gridPosition.row < config.gridSize &&
        gridPosition.col >= 0 &&
        gridPosition.col < config.gridSize
      ) {
        onPixelClick(gridPosition);
      }
    },
    [config.pixelSize, config.gridSize]
  );

  /**
   * Handle canvas mouse move events (for drawing while dragging)
   */
  const handleCanvasMouseMove = useCallback(
    (
      event: React.MouseEvent<HTMLCanvasElement>,
      onPixelHover: (position: GridPosition | null) => void,
      isDrawing: boolean = false
    ) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const coordinates: Coordinates = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const gridPosition = canvasToGrid(coordinates, config.pixelSize);

      // Check if position is within bounds
      if (
        gridPosition.row >= 0 &&
        gridPosition.row < config.gridSize &&
        gridPosition.col >= 0 &&
        gridPosition.col < config.gridSize
      ) {
        onPixelHover(gridPosition);
      } else {
        onPixelHover(null);
      }
    },
    [config.pixelSize, config.gridSize]
  );

  /**
   * Clear the canvas
   */
  const clearCanvas = useCallback(() => {
    if (canvasServiceRef.current) {
      try {
        canvasServiceRef.current.clear();
      } catch (error) {
        console.error("Failed to clear canvas:", error);
      }
    }
  }, []);

  /**
   * Export canvas as image
   */
  const exportCanvas = useCallback(
    (scale: number = 1): HTMLCanvasElement | null => {
      if (canvasServiceRef.current) {
        try {
          return canvasServiceRef.current.createScaledCanvas(scale);
        } catch (error) {
          console.error("Failed to export canvas:", error);
          return null;
        }
      }
      return null;
    },
    []
  );

  /**
   * Create pixel-perfect export canvas
   */
  const exportPixelPerfect = useCallback(
    (pixels: PixelGrid): HTMLCanvasElement | null => {
      if (canvasServiceRef.current) {
        try {
          return canvasServiceRef.current.createPixelPerfectCanvas(pixels);
        } catch (error) {
          console.error("Failed to create pixel-perfect export:", error);
          return null;
        }
      }
      return null;
    },
    []
  );

  /**
   * Get canvas image data
   */
  const getImageData = useCallback((): ImageData | null => {
    if (canvasServiceRef.current) {
      return canvasServiceRef.current.getImageData();
    }
    return null;
  }, []);

  /**
   * Check if canvas is initialized
   */
  const isInitialized = useCallback((): boolean => {
    return canvasServiceRef.current?.isInitialized() ?? false;
  }, []);

  return {
    canvasRef,
    updateConfig,
    renderGrid,
    handleCanvasClick,
    handleCanvasMouseMove,
    clearCanvas,
    exportCanvas,
    exportPixelPerfect,
    getImageData,
    isInitialized,
  };
};
