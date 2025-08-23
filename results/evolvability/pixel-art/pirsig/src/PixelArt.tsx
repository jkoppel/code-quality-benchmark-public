import React from 'react';
import './PixelArt.css';
import { usePixelArt } from './hooks/usePixelArt';
import ColorPicker from './components/ColorPicker';
import DrawingCanvas from './components/DrawingCanvas';
import ToolBar from './components/ToolBar';

const PixelArt: React.FC = () => {
  const {
    selectedColor,
    setSelectedColor,
    canvasRef,
    fileInputRef,
    handleCanvasClick,
    handleSave,
    handleLoad,
    triggerFileInput
  } = usePixelArt();

  return (
    <div className="pixel-art-container">
      <h1>Pixel Art Editor</h1>
      
      <ColorPicker 
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
      />

      <DrawingCanvas
        ref={canvasRef}
        onClick={handleCanvasClick}
      />

      <ToolBar
        ref={fileInputRef}
        onSave={handleSave}
        onLoadClick={triggerFileInput}
        onFileChange={handleLoad}
      />
    </div>
  );
};

export default PixelArt;