import {
  CanvasOperations,
  GridPosition,
  ColorString,
  PixelGrid,
} from "../types";
import { CANVAS_CONFIG } from "../config/constants";
import { GridUtility } from "../utils";

/**
 * Canvas Renderer service following Single Responsibility Principle
 * Handles all canvas drawing operations
 */
export class CanvasRenderer implements CanvasOperations {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private pixels: PixelGrid;

  constructor(canvas: HTMLCanvasElement, initialPixels: PixelGrid) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to get 2D rendering context");
    }

    this.context = context;
    this.pixels = initialPixels;
    this.setupCanvas();
  }

  /**
   * Sets up canvas dimensions and initial properties
   */
  private setupCanvas(): void {
    const { gridSize, pixelSize } = CANVAS_CONFIG;
    this.canvas.width = gridSize * pixelSize;
    this.canvas.height = gridSize * pixelSize;
  }

  /**
   * Updates the pixel grid and redraws the canvas
   */
  updatePixels(newPixels: PixelGrid): void {
    this.pixels = newPixels;
    this.redraw();
  }

  /**
   * Draws a single pixel at the specified grid position
   */
  drawPixel(position: GridPosition, color: ColorString): void {
    if (!GridUtility.isValidGridPosition(position)) {
      console.warn(`Invalid grid position: ${position.row}, ${position.col}`);
      return;
    }

    const { pixelSize } = CANVAS_CONFIG;
    const canvasPos = GridUtility.gridToCanvas(position);

    this.context.fillStyle = color;
    this.context.fillRect(canvasPos.x, canvasPos.y, pixelSize, pixelSize);

    // Draw grid line around the pixel
    this.drawPixelBorder(position);
  }

  /**
   * Draws border around a single pixel
   */
  private drawPixelBorder(position: GridPosition): void {
    const { pixelSize, strokeColor } = CANVAS_CONFIG;
    const canvasPos = GridUtility.gridToCanvas(position);

    this.context.strokeStyle = strokeColor;
    this.context.lineWidth = 1;
    this.context.strokeRect(canvasPos.x, canvasPos.y, pixelSize, pixelSize);
  }

  /**
   * Clears the entire canvas
   */
  clearCanvas(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draws the grid lines
   */
  drawGrid(): void {
    const { gridSize, pixelSize, strokeColor } = CANVAS_CONFIG;

    this.context.strokeStyle = strokeColor;
    this.context.lineWidth = 1;

    // Draw vertical lines
    for (let i = 0; i <= gridSize; i++) {
      const x = i * pixelSize;
      this.context.beginPath();
      this.context.moveTo(x, 0);
      this.context.lineTo(x, gridSize * pixelSize);
      this.context.stroke();
    }

    // Draw horizontal lines
    for (let i = 0; i <= gridSize; i++) {
      const y = i * pixelSize;
      this.context.beginPath();
      this.context.moveTo(0, y);
      this.context.lineTo(gridSize * pixelSize, y);
      this.context.stroke();
    }
  }

  /**
   * Gets the color of a pixel at the specified grid position
   */
  getPixelColor(position: GridPosition): ColorString {
    return GridUtility.getPixelAt(this.pixels, position);
  }

  /**
   * Redraws the entire canvas with current pixel data
   */
  redraw(): void {
    this.clearCanvas();
    this.drawAllPixels();
    this.drawGrid();
  }

  /**
   * Draws all pixels from the current pixel grid
   */
  private drawAllPixels(): void {
    const { gridSize } = CANVAS_CONFIG;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const position: GridPosition = { row, col };
        const color = this.pixels[row][col];
        this.drawPixelWithoutBorder(position, color);
      }
    }
  }

  /**
   * Draws a pixel without border (used for bulk drawing)
   */
  private drawPixelWithoutBorder(
    position: GridPosition,
    color: ColorString
  ): void {
    const { pixelSize } = CANVAS_CONFIG;
    const canvasPos = GridUtility.gridToCanvas(position);

    this.context.fillStyle = color;
    this.context.fillRect(canvasPos.x, canvasPos.y, pixelSize, pixelSize);
  }

  /**
   * Creates a data URL of the current canvas content
   */
  toDataURL(type: string = "image/png"): string {
    return this.canvas.toDataURL(type);
  }

  /**
   * Creates a blob of the current canvas content
   */
  toBlob(callback: BlobCallback, type?: string, quality?: number): void {
    this.canvas.toBlob(callback, type, quality);
  }

  /**
   * Gets the canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Gets the rendering context
   */
  getContext(): CanvasRenderingContext2D {
    return this.context;
  }
}
