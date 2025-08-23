import { Coordinates, GridPosition, ValidationResult } from "../types";
import { ERROR_MESSAGES } from "../config/constants";

/**
 * Converts canvas coordinates to grid position
 */
export const canvasToGrid = (
  coordinates: Coordinates,
  pixelSize: number
): GridPosition => {
  return {
    row: Math.floor(coordinates.y / pixelSize),
    col: Math.floor(coordinates.x / pixelSize),
  };
};

/**
 * Converts grid position to canvas coordinates
 */
export const gridToCanvas = (
  position: GridPosition,
  pixelSize: number
): Coordinates => {
  return {
    x: position.col * pixelSize,
    y: position.row * pixelSize,
  };
};

/**
 * Validates grid position is within bounds
 */
export const validateGridPosition = (
  position: GridPosition,
  gridSize: number
): ValidationResult => {
  const errors: string[] = [];

  if (position.row < 0 || position.row >= gridSize) {
    errors.push(`Row ${ERROR_MESSAGES.INVALID_COORDINATES}`);
  }
  if (position.col < 0 || position.col >= gridSize) {
    errors.push(`Column ${ERROR_MESSAGES.INVALID_COORDINATES}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates canvas coordinates
 */
export const validateCoordinates = (
  coordinates: Coordinates
): ValidationResult => {
  const errors: string[] = [];

  if (coordinates.x < 0 || coordinates.y < 0) {
    errors.push(ERROR_MESSAGES.INVALID_COORDINATES);
  }
  if (!Number.isFinite(coordinates.x) || !Number.isFinite(coordinates.y)) {
    errors.push(ERROR_MESSAGES.INVALID_COORDINATES);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Clamps grid position to valid bounds
 */
export const clampGridPosition = (
  position: GridPosition,
  gridSize: number
): GridPosition => {
  return {
    row: Math.max(0, Math.min(gridSize - 1, position.row)),
    col: Math.max(0, Math.min(gridSize - 1, position.col)),
  };
};

/**
 * Calculates distance between two grid positions
 */
export const getGridDistance = (
  pos1: GridPosition,
  pos2: GridPosition
): number => {
  const dx = pos2.col - pos1.col;
  const dy = pos2.row - pos1.row;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Gets neighboring grid positions (8-directional)
 */
export const getNeighbors = (
  position: GridPosition,
  gridSize: number
): GridPosition[] => {
  const neighbors: GridPosition[] = [];
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const [dRow, dCol] of directions) {
    const newRow = position.row + dRow;
    const newCol = position.col + dCol;

    if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }

  return neighbors;
};

/**
 * Checks if two grid positions are adjacent
 */
export const areAdjacent = (
  pos1: GridPosition,
  pos2: GridPosition
): boolean => {
  const dx = Math.abs(pos2.col - pos1.col);
  const dy = Math.abs(pos2.row - pos1.row);
  return dx <= 1 && dy <= 1 && dx + dy > 0;
};
