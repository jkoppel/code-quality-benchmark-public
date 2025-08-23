import { PixelGrid, FileLoadResult, FileSaveOptions } from "../types";
import {
  DEFAULT_CANVAS_CONFIG,
  SUPPORTED_FILE_TYPES,
  ERROR_MESSAGES,
  VALIDATION_RULES,
} from "../config/constants";
import { stringToRgb, rgbToString } from "../utils/colorUtils";

/**
 * Service class for handling file operations
 * Follows Single Responsibility Principle - only handles file I/O operations
 */
export class FileService {
  /**
   * Save pixel grid as an image file
   */
  public static async saveAsImage(
    pixels: PixelGrid,
    options: Partial<FileSaveOptions> = {}
  ): Promise<void> {
    const saveOptions: FileSaveOptions = {
      filename: "pixel-art",
      format: "png",
      quality: 1.0,
      ...options,
    };

    try {
      const canvas = this.createExportCanvas(pixels);
      const blob = await this.canvasToBlob(canvas, saveOptions);
      this.downloadBlob(blob, `${saveOptions.filename}.${saveOptions.format}`);
    } catch (error) {
      throw new Error(`${ERROR_MESSAGES.SAVE_ERROR}: ${error}`);
    }
  }

  /**
   * Load pixel grid from an image file
   */
  public static async loadFromFile(file: File): Promise<FileLoadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(", "),
        };
      }

      const pixels = await this.fileToPixelGrid(file);
      return {
        success: true,
        data: pixels,
      };
    } catch (error) {
      return {
        success: false,
        error: `${ERROR_MESSAGES.FILE_LOAD_ERROR}: ${error}`,
      };
    }
  }

  /**
   * Export pixel grid as JSON
   */
  public static saveAsJSON(
    pixels: PixelGrid,
    filename: string = "pixel-art"
  ): void {
    const data = {
      version: "1.0",
      gridSize: pixels.length,
      pixels: pixels,
      timestamp: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    this.downloadBlob(blob, `${filename}.json`);
  }

  /**
   * Load pixel grid from JSON file
   */
  public static async loadFromJSON(file: File): Promise<FileLoadResult> {
    try {
      if (file.type !== "application/json") {
        return {
          success: false,
          error: "Invalid file type. Please select a JSON file.",
        };
      }

      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.pixels || !Array.isArray(data.pixels)) {
        return {
          success: false,
          error: "Invalid JSON format. Missing pixel data.",
        };
      }

      return {
        success: true,
        data: data.pixels,
      };
    } catch (error) {
      return {
        success: false,
        error: `Error parsing JSON: ${error}`,
      };
    }
  }

  /**
   * Create export canvas from pixel grid
   */
  private static createExportCanvas(pixels: PixelGrid): HTMLCanvasElement {
    const gridSize = pixels.length;
    const canvas = document.createElement("canvas");
    canvas.width = gridSize;
    canvas.height = gridSize;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error(ERROR_MESSAGES.CONTEXT_NOT_AVAILABLE);
    }

    // Render pixels
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        context.fillStyle = pixels[row][col];
        context.fillRect(col, row, 1, 1);
      }
    }

    return canvas;
  }

  /**
   * Convert canvas to blob
   */
  private static async canvasToBlob(
    canvas: HTMLCanvasElement,
    options: FileSaveOptions
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const mimeType = `image/${options.format}`;
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        mimeType,
        options.quality
      );
    });
  }

  /**
   * Download blob as file
   */
  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Convert image file to pixel grid
   */
  private static async fileToPixelGrid(file: File): Promise<PixelGrid> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          try {
            const pixels = this.imageToPixelGrid(img);
            resolve(pixels);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };

        img.src = event.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert image to pixel grid
   */
  private static imageToPixelGrid(img: HTMLImageElement): PixelGrid {
    const canvas = document.createElement("canvas");
    const gridSize = DEFAULT_CANVAS_CONFIG.gridSize;

    canvas.width = gridSize;
    canvas.height = gridSize;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error(ERROR_MESSAGES.CONTEXT_NOT_AVAILABLE);
    }

    // Draw image scaled to grid size
    context.drawImage(img, 0, 0, gridSize, gridSize);

    // Extract pixel data
    const imageData = context.getImageData(0, 0, gridSize, gridSize);
    const pixels: PixelGrid = [];

    for (let row = 0; row < gridSize; row++) {
      pixels[row] = [];
      for (let col = 0; col < gridSize; col++) {
        const index = (row * gridSize + col) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        pixels[row][col] = rgbToString({ r, g, b });
      }
    }

    return pixels;
  }

  /**
   * Validate file before processing
   */
  private static validateFile(file: File): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check file size
    if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
      errors.push(
        `File size exceeds ${
          VALIDATION_RULES.MAX_FILE_SIZE / (1024 * 1024)
        }MB limit`
      );
    }

    // Check file type
    if (!SUPPORTED_FILE_TYPES.includes(file.type as any)) {
      errors.push(ERROR_MESSAGES.INVALID_FILE_TYPE);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
