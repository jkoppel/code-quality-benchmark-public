import { PixelGrid, CanvasConfig, GridPosition, RGBColor } from "../types";
import { ERROR_MESSAGES } from "../config/constants";
import { rgbToString } from "../utils/colorUtils";
import { validateGridPosition } from "../utils/coordinateUtils";

/**
 * Service class for handling canvas operations
 * Follows Single Responsibility Principle - only handles canvas rendering and manipulation
 */
export class CanvasService {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private config: CanvasConfig;

  constructor(config: CanvasConfig) {
    this.config = config;
  }

  /**
   * Initialize the canvas service with a canvas element
   */
  public initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");

    if (!this.context) {
      throw new Error(ERROR_MESSAGES.CONTEXT_NOT_AVAILABLE);
    }

    // Set canvas dimensions
    canvas.width = this.config.gridSize * this.config.pixelSize;
    canvas.height = this.config.gridSize * this.config.pixelSize;
  }

  /**
   * Render the entire pixel grid to the canvas
   */
  public renderGrid(pixels: PixelGrid): void {
    if (!this.context || !this.canvas) {
      throw new Error(ERROR_MESSAGES.CANVAS_NOT_FOUND);
    }

    // Clear the canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render each pixel
    for (let row = 0; row < this.config.gridSize; row++) {
      for (let col = 0; col < this.config.gridSize; col++) {
        this.renderPixel({ row, col }, pixels[row][col]);
      }
    }
  }

  /**
   * Render a single pixel at the specified position
   */
  public renderPixel(position: GridPosition, color: string): void {
    if (!this.context) {
      throw new Error(ERROR_MESSAGES.CONTEXT_NOT_AVAILABLE);
    }

    const validation = validateGridPosition(position, this.config.gridSize);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const x = position.col * this.config.pixelSize;
    const y = position.row * this.config.pixelSize;

    // Fill the pixel
    this.context.fillStyle = color;
    this.context.fillRect(x, y, this.config.pixelSize, this.config.pixelSize);

    // Draw the border
    this.context.strokeStyle = this.config.strokeColor;
    this.context.strokeRect(x, y, this.config.pixelSize, this.config.pixelSize);
  }

  /**
   * Get pixel data from canvas as ImageData
   */
  public getImageData(): ImageData | null {
    if (!this.context || !this.canvas) {
      return null;
    }

    return this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  /**
   * Create a scaled version of the canvas for export
   */
  public createScaledCanvas(scale: number = 1): HTMLCanvasElement {
    if (!this.canvas) {
      throw new Error(ERROR_MESSAGES.CANVAS_NOT_FOUND);
    }

    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = this.config.gridSize * scale;
    scaledCanvas.height = this.config.gridSize * scale;

    const scaledContext = scaledCanvas.getContext("2d");
    if (!scaledContext) {
      throw new Error(ERROR_MESSAGES.CONTEXT_NOT_AVAILABLE);
    }

    // Disable image smoothing for pixel art
    scaledContext.imageSmoothingEnabled = false;

    // Draw the original canvas scaled
    scaledContext.drawImage(
      this.canvas,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      0,
      0,
      scaledCanvas.width,
      scaledCanvas.height
    );

    return scaledCanvas;
  }

  /**
   * Create a pixel-perfect export canvas
   */
  public createPixelPerfectCanvas(pixels: PixelGrid): HTMLCanvasElement {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = this.config.gridSize;
    exportCanvas.height = this.config.gridSize;

    const exportContext = exportCanvas.getContext("2d");
    if (!exportContext) {
      throw new Error(ERROR_MESSAGES.CONTEXT_NOT_AVAILABLE);
    }

    // Render each pixel as a single pixel on the export canvas
    for (let row = 0; row < this.config.gridSize; row++) {
      for (let col = 0; col < this.config.gridSize; col++) {
        exportContext.fillStyle = pixels[row][col];
        exportContext.fillRect(col, row, 1, 1);
      }
    }

    return exportCanvas;
  }

  /**
   * Clear the entire canvas
   */
  public clear(): void {
    if (!this.context || !this.canvas) {
      throw new Error(ERROR_MESSAGES.CANVAS_NOT_FOUND);
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Fill with background color
    this.context.fillStyle = this.config.backgroundColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Update canvas configuration
   */
  public updateConfig(newConfig: Partial<CanvasConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Reinitialize if canvas is available
    if (this.canvas) {
      this.initialize(this.canvas);
    }
  }

  /**
   * Get current canvas configuration
   */
  public getConfig(): CanvasConfig {
    return { ...this.config };
  }

  /**
   * Check if the service is properly initialized
   */
  public isInitialized(): boolean {
    return this.canvas !== null && this.context !== null;
  }
}
