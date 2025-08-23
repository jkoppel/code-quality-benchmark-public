import React, { useRef } from 'react';
import './styles/PixelArt.css';
import { usePixelArt } from './hooks/usePixelArt';
import { ColorPicker } from './components/ColorPicker';
import { CanvasGrid } from './components/CanvasGrid';
import { Controls } from './components/Controls';
import { FileLoader } from './components/FileLoader';

const PixelArt: React.FC = () => {
  const {
    pixels,
    selectedColor,
    updatePixel,
    updateColor,
    loadPixels
  } = usePixelArt();
  
  const fileLoaderRef = useRef<HTMLInputElement>(null);

  const handleLoadClick = () => {
    fileLoaderRef.current?.click();
  };

  return (
    <div className="pixel-art-container">
      <h1>Pixel Art Editor</h1>
      
      <ColorPicker
        selectedColor={selectedColor}
        onColorChange={updateColor}
      />

      <CanvasGrid
        pixels={pixels}
        onPixelClick={updatePixel}
      />

      <Controls
        pixels={pixels}
        onLoadClick={handleLoadClick}
      />
      
      <FileLoader
        ref={fileLoaderRef}
        onLoad={loadPixels}
      />
    </div>
  );
};

export default PixelArt;