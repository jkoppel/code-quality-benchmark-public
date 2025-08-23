import React, { useCallback } from 'react';
import { GridPosition } from './types';
import { DEFAULT_CANVAS_CONFIG } from './config/constants';
import { usePixelGrid } from './hooks/usePixelGrid';
import { useColorPicker } from './hooks/useColorPicker';
import { FileService } from './services/FileService';
import ColorPicker from './components/ColorPicker';
import DrawingCanvas from './components/DrawingCanvas';
import Controls from './components/Controls';
import ErrorBoundary from './components/ErrorBoundary';
import './PixelArt.css';

/**
 * Main PixelArt component - orchestrates the pixel art editor
 * Follows SOLID principles with proper separation of concerns
 */
const PixelArt: React.FC = () => {
  // Custom hooks for state management
  const {
    pixels,
    setPixel,
    clearGrid,
    loadGrid,
    undo,
    redo,
    canUndo,
    canRedo,
  } = usePixelGrid(DEFAULT_CANVAS_CONFIG.gridSize);

  const {
    selectedColor,
    setColor,
  } = useColorPicker();

  /**
   * Handle pixel click on canvas
   */
  const handlePixelClick = useCallback((position: GridPosition) => {
    setPixel(position, selectedColor);
  }, [setPixel, selectedColor]);

  /**
   * Handle save operation
   */
  const handleSave = useCallback(async () => {
    try {
      await FileService.saveAsImage(pixels, {
        filename: 'pixel-art',
        format: 'png',
      });
    } catch (error) {
      console.error('Failed to save image:', error);
      alert('Failed to save image. Please try again.');
    }
  }, [pixels]);

  /**
   * Handle load operation
   */
  const handleLoad = useCallback(async (file: File) => {
    try {
      const result = await FileService.loadFromFile(file);
      
      if (result.success && result.data) {
        loadGrid(result.data);
      } else {
        console.error('Failed to load file:', result.error);
        alert(`Failed to load file: ${result.error}`);
      }
    } catch (error) {
      console.error('Unexpected error loading file:', error);
      alert('An unexpected error occurred while loading the file.');
    }
  }, [loadGrid]);

  /**
   * Handle clear operation with confirmation
   */
  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire canvas? This action cannot be undone.')) {
      clearGrid();
    }
  }, [clearGrid]);

  /**
   * Handle undo operation
   */
  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
    }
  }, [undo, canUndo]);

  /**
   * Handle redo operation
   */
  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
    }
  }, [redo, canRedo]);

  return (
    <ErrorBoundary>
      <div className="pixel-art-container">
        <header className="app-header">
          <h1>🎨 Pixel Art Editor</h1>
          <p>Create beautiful pixel art with our easy-to-use editor</p>
        </header>
        
        <main className="app-main">
          <div className="editor-layout">
            <aside className="sidebar">
              <ColorPicker 
                selectedColor={selectedColor} 
                onColorChange={setColor} 
              />
              
              <Controls
                onSave={handleSave}
                onLoad={handleLoad}
                onClear={handleClear}
                onUndo={canUndo ? handleUndo : undefined}
                onRedo={canRedo ? handleRedo : undefined}
              />
            </aside>
            
            <section className="canvas-section">
              <DrawingCanvas
                pixels={pixels}
                selectedColor={selectedColor}
                config={DEFAULT_CANVAS_CONFIG}
                onPixelClick={handlePixelClick}
              />
            </section>
          </div>
        </main>
        
        <footer className="app-footer">
          <p>Click on the canvas to draw • Use controls to save/load your artwork</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default PixelArt;