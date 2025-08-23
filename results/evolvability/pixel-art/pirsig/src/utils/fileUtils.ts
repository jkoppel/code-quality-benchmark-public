import { PixelGrid } from '../types';
import { GRID_SIZE, DEFAULT_FILENAME } from '../constants';

export const savePixelArt = (pixels: PixelGrid, filename: string = DEFAULT_FILENAME): void => {
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
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
};

export const loadPixelArt = (
  file: File,
  onLoad: (pixels: PixelGrid) => void
): void => {
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
      const newPixels: PixelGrid = [];

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
      
      onLoad(newPixels);
    };
    
    img.src = event.target?.result as string;
  };
  
  reader.readAsDataURL(file);
};