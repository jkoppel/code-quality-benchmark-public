import { useRef, useCallback } from "react";
import { FileHandler } from "../services";
import { PixelGrid, FileFormat } from "../types";

/**
 * Custom hook for managing file operations
 * Encapsulates file save/load functionality
 */
export const useFileHandler = () => {
  const fileHandlerRef = useRef<FileHandler>(new FileHandler());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Saves the pixel grid as an image file
   */
  const saveImage = useCallback(
    async (pixels: PixelGrid, format: FileFormat = FileFormat.BMP) => {
      try {
        await fileHandlerRef.current.saveAsImage(pixels, format);
      } catch (error) {
        console.error("Failed to save image:", error);
        throw error;
      }
    },
    []
  );

  /**
   * Loads an image file and returns pixel grid
   */
  const loadImage = useCallback(async (file: File): Promise<PixelGrid> => {
    try {
      return await fileHandlerRef.current.loadFromImage(file);
    } catch (error) {
      console.error("Failed to load image:", error);
      throw error;
    }
  }, []);

  /**
   * Creates and manages file input element
   */
  const createFileInput = useCallback(
    (onFileSelected: (pixels: PixelGrid) => void) => {
      if (!fileInputRef.current) {
        fileInputRef.current = fileHandlerRef.current.createFileInput(
          async (file) => {
            try {
              const pixels = await loadImage(file);
              onFileSelected(pixels);
            } catch (error) {
              console.error("Error processing selected file:", error);
              // You might want to show an error message to the user here
            }
          }
        );
      }
      return fileInputRef.current;
    },
    [loadImage]
  );

  /**
   * Triggers file selection dialog
   */
  const triggerFileSelection = useCallback(() => {
    if (fileInputRef.current) {
      FileHandler.triggerFileSelection(fileInputRef.current);
    }
  }, []);

  /**
   * Handles file input change event
   */
  const handleFileInputChange = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement>,
      onFileSelected: (pixels: PixelGrid) => void
    ) => {
      const file = event.target.files?.[0];
      if (file) {
        loadImage(file)
          .then(onFileSelected)
          .catch((error) => {
            console.error("Error loading file:", error);
            // You might want to show an error message to the user here
          });
      }
    },
    [loadImage]
  );

  return {
    saveImage,
    loadImage,
    createFileInput,
    triggerFileSelection,
    handleFileInputChange,
    fileInputRef,
  };
};
