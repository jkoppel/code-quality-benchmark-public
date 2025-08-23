import { Position, GridPosition, PixelGrid } from "../types";
import { CANVAS_CONFIG } from "../config/constants";

/**
 * Grid utility class for coordinate conversions and grid operations
 * Follows Single Responsibility Principle
 */
export class GridUtility {
  /**
   * Converts canvas coordinates to grid position
   */
  static canvasToGrid(canvasPos: Position): GridPosition {
    const col = Math.floor(canvasPos.x / CANVAS_CONFIG.pixelSize);
    const row = Math.floor(canvasPos.y / CANVAS_CONFIG.pixelSize);

    return { row, col };
  }

  /**
   * Converts grid position to canvas coordinates
   */
  static gridToCanvas(gridPos: GridPosition): Position {
    return {
      x: gridPos.col * CANVAS_CONFIG.pixelSize,
      y: gridPos.row * CANVAS_CONFIG.pixelSize,
    };
  }

  /**
   * Checks if grid position is within bounds
   */
  static isValidGridPosition(position: GridPosition): boolean {
    const { row, col } = position;
    return (
      row >= 0 &&
      row < CANVAS_CONFIG.gridSize &&
      col >= 0 &&
      col < CANVAS_CONFIG.gridSize
    );
  }

  /**
   * Creates an empty pixel grid filled with default color
   */
  static createEmptyGrid(defaultColor: string = "#FFFFFF"): PixelGrid {
    return Array(CANVAS_CONFIG.gridSize)
      .fill(null)
      .map(() => Array(CANVAS_CONFIG.gridSize).fill(defaultColor));
  }

  /**
   * Creates a deep copy of a pixel grid
   */
  static cloneGrid(grid: PixelGrid): PixelGrid {
    return grid.map((row) => [...row]);
  }

  /**
   * Gets pixel color at specific grid position
   */
  static getPixelAt(grid: PixelGrid, position: GridPosition): string {
    if (!this.isValidGridPosition(position)) {
      throw new Error(
        `Invalid grid position: ${position.row}, ${position.col}`
      );
    }
    return grid[position.row][position.col];
  }

  /**
   * Sets pixel color at specific grid position
   */
  static setPixelAt(
    grid: PixelGrid,
    position: GridPosition,
    color: string
  ): PixelGrid {
    if (!this.isValidGridPosition(position)) {
      throw new Error(
        `Invalid grid position: ${position.row}, ${position.col}`
      );
    }

    const newGrid = this.cloneGrid(grid);
    newGrid[position.row][position.col] = color;
    return newGrid;
  }

  /**
   * Fills entire grid with specified color
   */
  static fillGrid(color: string): PixelGrid {
    return this.createEmptyGrid(color);
  }

  /**
   * Gets all neighboring positions (8-directional)
   */
  static getNeighbors(position: GridPosition): GridPosition[] {
    const { row, col } = position;
    const neighbors: GridPosition[] = [];

    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r === row && c === col) continue; // Skip center position

        const neighborPos = { row: r, col: c };
        if (this.isValidGridPosition(neighborPos)) {
          neighbors.push(neighborPos);
        }
      }
    }

    return neighbors;
  }
}
