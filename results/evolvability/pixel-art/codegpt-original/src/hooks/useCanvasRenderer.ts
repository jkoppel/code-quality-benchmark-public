import { useRef, useEffect, useCallback } from "react";
import { CanvasRenderer } from "../services";
import { PixelGrid, Position, GridPosition } from "../types";
import { GridUtility } from "../utils";

/**
 * Custom hook for managing canvas rendering
 * Encapsulates canvas operations and event handling
 */
export const useCanvasRenderer = (pixels: PixelGrid) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  /**
   * Initialize the canvas renderer
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      rendererRef.current = new CanvasRenderer(canvas, pixels);
    } catch (error) {
      console.error("Failed to initialize canvas renderer:", error);
    }

    return () => {
      rendererRef.current = null;
    };
  }, []); // Only run once on mount

  /**
   * Update pixels and redraw canvas
   */
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updatePixels(pixels);
    }
  }, [pixels]);

  /**
   * Handles canvas click events and converts to grid position
   */
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const canvasPos: Position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const gridPos = GridUtility.canvasToGrid(canvasPos);

      if (GridUtility.isValidGridPosition(gridPos)) {
        return gridPos;
      }

      return null;
    },
    []
  );

  /**
   * Gets the canvas data URL for saving
   */
  const getCanvasDataURL = useCallback(
    (type: string = "image/png"): string | null => {
      if (!rendererRef.current) return null;
      return rendererRef.current.toDataURL(type);
    },
    []
  );

  /**
   * Gets the canvas as a blob
   */
  const getCanvasBlob = useCallback(
    (callback: BlobCallback, type?: string): void => {
      if (!rendererRef.current) return;
      rendererRef.current.toBlob(callback, type);
    },
    []
  );

  /**
   * Clears the canvas
   */
  const clearCanvas = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.clearCanvas();
    }
  }, []);

  /**
   * Redraws the canvas
   */
  const redrawCanvas = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.redraw();
    }
  }, []);

  /**
   * Gets the pixel color at a grid position
   */
  const getPixelColor = useCallback((position: GridPosition): string | null => {
    if (!rendererRef.current) return null;
    return rendererRef.current.getPixelColor(position);
  }, []);

  return {
    canvasRef,
    handleCanvasClick,
    getCanvasDataURL,
    getCanvasBlob,
    clearCanvas,
    redrawCanvas,
    getPixelColor,
  };
};
