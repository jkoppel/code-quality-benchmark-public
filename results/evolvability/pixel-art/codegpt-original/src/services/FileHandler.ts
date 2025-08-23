import { FileOperations, PixelGrid, FileFormat } from "../types";
import { FILE_CONFIG, CANVAS_CONFIG } from "../config/constants";

/**
 * File Handler service following Single Responsibility Principle
 * Handles all file operations (save/load)
 */
export class FileHandler implements FileOperations {
  /**
   * Saves pixel grid as an image file
   */
  async saveAsImage(
    pixels: PixelGrid,
    format: FileFormat = FileFormat.BMP
  ): Promise<void> {
    try {
      const canvas = this.createCanvasFromPixels(pixels);
      const mimeType = this.getMimeType(format);

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob from canvas"));
            return;
          }

          this.downloadBlob(blob, `${FILE_CONFIG.defaultFileName}.${format}`);
          resolve();
        }, mimeType);
      });
    } catch (error) {
      throw new Error(
        `Failed to save image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Loads pixel grid from an image file
   */
  async loadFromImage(file: File): Promise<PixelGrid> {
    return new Promise((resolve, reject) => {
      if (!this.isValidImageFile(file)) {
        reject(new Error("Invalid file type. Please select an image file."));
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          try {
            const pixels = this.extractPixelsFromImage(img);
            resolve(pixels);
          } catch (error) {
            reject(
              new Error(
                `Failed to process image: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              )
            );
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
   * Creates a canvas element from pixel grid
   */
  private createCanvasFromPixels(pixels: PixelGrid): HTMLCanvasElement {
    const { gridSize } = CANVAS_CONFIG;
    const canvas = document.createElement("canvas");
    canvas.width = gridSize;
    canvas.height = gridSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to get 2D rendering context");
    }

    // Draw each pixel as a 1x1 rectangle
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        ctx.fillStyle = pixels[row][col];
        ctx.fillRect(col, row, 1, 1);
      }
    }

    return canvas;
  }

  /**
   * Extracts pixel data from an image and converts to pixel grid
   */
  private extractPixelsFromImage(img: HTMLImageElement): PixelGrid {
    const { gridSize } = CANVAS_CONFIG;
    const canvas = document.createElement("canvas");
    canvas.width = gridSize;
    canvas.height = gridSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to get 2D rendering context");
    }

    // Draw image scaled to grid size
    ctx.drawImage(img, 0, 0, gridSize, gridSize);

    // Extract pixel data
    const imageData = ctx.getImageData(0, 0, gridSize, gridSize);
    const pixels: PixelGrid = [];

    for (let row = 0; row < gridSize; row++) {
      pixels[row] = [];
      for (let col = 0; col < gridSize; col++) {
        const index = (row * gridSize + col) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        // const a = imageData.data[index + 3]; // Alpha channel (not used currently)

        pixels[row][col] = `rgb(${r}, ${g}, ${b})`;
      }
    }

    return pixels;
  }

  /**
   * Downloads a blob as a file
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL
    URL.revokeObjectURL(url);
  }

  /**
   * Gets MIME type for file format
   */
  private getMimeType(format: FileFormat): string {
    const mimeTypes = {
      [FileFormat.BMP]: "image/bmp",
      [FileFormat.PNG]: "image/png",
      [FileFormat.JPEG]: "image/jpeg",
    };

    return mimeTypes[format] || "image/png";
  }

  /**
   * Validates if file is a valid image file
   */
  private isValidImageFile(file: File): boolean {
    return file.type.startsWith("image/");
  }

  /**
   * Gets file extension from file name
   */
  private getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "";
  }

  /**
   * Creates a file input element for file selection
   */
  createFileInput(onChange: (file: File) => void): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = FILE_CONFIG.acceptedFileTypes.join(",");
    input.style.display = "none";

    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        onChange(file);
      }
      // Reset input value to allow selecting the same file again
      target.value = "";
    });

    return input;
  }

  /**
   * Triggers file selection dialog
   */
  static triggerFileSelection(input: HTMLInputElement): void {
    input.click();
  }
}
