import React, { useState } from "react";
import { ColorPicker, DrawingCanvas, FileControls } from "./components";
import {
  usePixelGrid,
  useColorPicker,
  useCanvasRenderer,
  useFileHandler,
} from "./hooks";
import { FileFormat, GridPosition } from "./types";
import "./PixelArt.css";

/**
 * Refactored PixelArt component following SOLID principles and best practices
 * - Single Responsibility: Each component has one clear purpose
 * - Open/Closed: Easy to extend with new features
 * - Liskov Substitution: Components can be easily replaced
 * - Interface Segregation: Clean, focused interfaces
 * - Dependency Inversion: Depends on abstractions, not concretions
 */
const PixelArtRefactored: React.FC = () => {
  // State management using custom hooks
  const { pixels, setPixel, clearGrid, replaceGrid } = usePixelGrid();
  const {
    selectedColor,
    updateColorComponent,
    getColorString,
    setRandomColor,
    resetColor,
  } = useColorPicker();

  // Canvas rendering hook
  const { canvasRef } = useCanvasRenderer(pixels);

  // File operations hook
  const { saveImage, fileInputRef, handleFileInputChange } = useFileHandler();

  // Loading state for better UX
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles canvas click events
   */
  const onCanvasClick = (position: GridPosition | null) => {
    if (position) {
      const colorString = getColorString();
      setPixel(position, colorString);
    }
  };

  /**
   * Handles save operation
   */
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveImage(pixels, FileFormat.BMP);
    } catch (error) {
      console.error("Failed to save image:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles load operation
   */
  const handleLoad = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handles file input change
   */
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    handleFileInputChange(event, (loadedPixels) => {
      replaceGrid(loadedPixels);
      setIsLoading(false);
    });
  };

  /**
   * Handles clear canvas operation
   */
  const handleClear = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the canvas? This action cannot be undone."
      )
    ) {
      clearGrid();
    }
  };

  return (
    <div className="pixel-art-container">
      <header className="app-header">
        <h1>Pixel Art Editor</h1>
        <p className="app-description">
          Create beautiful pixel art with our intuitive editor. Click on the
          canvas to paint with your selected color.
        </p>
      </header>

      <main className="app-main">
        <section className="editor-section">
          <ColorPicker
            selectedColor={selectedColor}
            onColorChange={updateColorComponent}
            onRandomColor={setRandomColor}
            onResetColor={resetColor}
          />

          <DrawingCanvas canvasRef={canvasRef} onCanvasClick={onCanvasClick} />

          <FileControls
            onSave={handleSave}
            onLoad={handleLoad}
            onClear={handleClear}
            fileInputRef={fileInputRef}
            onFileChange={onFileChange}
            isLoading={isLoading}
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Use the color picker to select colors, click on the canvas to paint,
          and save your masterpiece as a bitmap image.
        </p>
      </footer>
    </div>
  );
};

export default PixelArtRefactored;
