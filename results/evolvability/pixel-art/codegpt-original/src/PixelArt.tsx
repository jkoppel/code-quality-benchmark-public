import React, { useState, useRef, useEffect } from 'react';
import './PixelArt.css';

const GRID_SIZE = 32;
const PIXEL_SIZE = 15;

const PixelArt: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState({ r: 0, g: 0, b: 0 });
  const [pixels, setPixels] = useState<string[][]>(() => 
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('#FFFFFF'))
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          ctx.fillStyle = pixels[row][col];
          ctx.fillRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
          
          ctx.strokeStyle = '#E0E0E0';
          ctx.strokeRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      }
    };
    
    drawCanvas();
  }, [pixels]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor(x / PIXEL_SIZE);
    const row = Math.floor(y / PIXEL_SIZE);
    
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      const newPixels = [...pixels];
      newPixels[row][col] = `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`;
      setPixels(newPixels);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = GRID_SIZE;
    tempCanvas.height = GRID_SIZE;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        tempCtx.fillStyle = pixels[row][col];
        tempCtx.fillRect(col, row, 1, 1);
      }
    }

    tempCanvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pixel-art.bmp';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = GRID_SIZE;
        tempCanvas.height = GRID_SIZE;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (!tempCtx) return;

        tempCtx.drawImage(img, 0, 0, GRID_SIZE, GRID_SIZE);
        const imageData = tempCtx.getImageData(0, 0, GRID_SIZE, GRID_SIZE);
        const newPixels: string[][] = [];

        for (let row = 0; row < GRID_SIZE; row++) {
          newPixels[row] = [];
          for (let col = 0; col < GRID_SIZE; col++) {
            const index = (row * GRID_SIZE + col) * 4;
            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];
            newPixels[row][col] = `rgb(${r}, ${g}, ${b})`;
          }
        }
        
        setPixels(newPixels);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="pixel-art-container">
      <h1>Pixel Art Editor</h1>
      
      <div className="color-picker">
        <h3>Color Picker</h3>
        <div className="rgb-controls">
          <div className="color-input">
            <label>R:</label>
            <input
              type="range"
              min="0"
              max="255"
              value={selectedColor.r}
              onChange={(e) => setSelectedColor({ ...selectedColor, r: parseInt(e.target.value) })}
            />
            <span>{selectedColor.r}</span>
          </div>
          <div className="color-input">
            <label>G:</label>
            <input
              type="range"
              min="0"
              max="255"
              value={selectedColor.g}
              onChange={(e) => setSelectedColor({ ...selectedColor, g: parseInt(e.target.value) })}
            />
            <span>{selectedColor.g}</span>
          </div>
          <div className="color-input">
            <label>B:</label>
            <input
              type="range"
              min="0"
              max="255"
              value={selectedColor.b}
              onChange={(e) => setSelectedColor({ ...selectedColor, b: parseInt(e.target.value) })}
            />
            <span>{selectedColor.b}</span>
          </div>
        </div>
        <div 
          className="color-preview" 
          style={{ backgroundColor: `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})` }}
        />
      </div>

      <canvas
        ref={canvasRef}
        width={GRID_SIZE * PIXEL_SIZE}
        height={GRID_SIZE * PIXEL_SIZE}
        onClick={handleCanvasClick}
        className="drawing-canvas"
      />

      <div className="controls">
        <button onClick={handleSave}>Save as Bitmap</button>
        <button onClick={() => fileInputRef.current?.click()}>Load Bitmap</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLoad}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default PixelArt;