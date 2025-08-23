import { PixelGrid } from '../types';
import { GRID_SIZE, FILE_DOWNLOAD_NAME } from '../constants';
import { createPixelCanvas } from './canvasUtils';

export const savePixelsAsBitmap = (pixels: PixelGrid): void => {
  const canvas = createPixelCanvas(pixels);
  
  canvas.toBlob((blob) => {
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = FILE_DOWNLOAD_NAME;
    a.click();
    URL.revokeObjectURL(url);
  });
};

export const loadImageAsPixels = (
  file: File,
  callback: (pixels: PixelGrid) => void
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
      
      callback(newPixels);
    };
    
    img.src = event.target?.result as string;
  };
  
  reader.readAsDataURL(file);
};