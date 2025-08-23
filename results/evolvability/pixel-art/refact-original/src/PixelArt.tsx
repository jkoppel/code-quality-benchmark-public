import React from 'react';
import usePixelArt from './hooks/usePixelArt';
import ColorPicker from './components/ColorPicker';
import CanvasGrid from './components/CanvasGrid';
import Controls from './components/Controls';
import FileLoader from './components/FileLoader';
import './styles/PixelArt.css';

const PixelArt: React.FC = () => {
  const {
    selectedColor,
    setSelectedColor,
    canvasRef,
    fileInputRef,
    error,
    handleCanvasClick,
    handleSave,
    handleLoadFile,
    triggerFileLoad,
  } = usePixelArt();

  return (
    <div className="pixel-art-container">
      <h1>Pixel Art Editor</h1>
      {error && <div className="error">Error: {error}</div>}
      <ColorPicker color={selectedColor} onChange={setSelectedColor} />
      <CanvasGrid canvasRef={canvasRef} onClick={handleCanvasClick} />
      <Controls onSave={handleSave} onLoadClick={triggerFileLoad} />
      <FileLoader fileInputRef={fileInputRef} onChange={handleLoadFile} />
    </div>
  );
};

export default PixelArt;