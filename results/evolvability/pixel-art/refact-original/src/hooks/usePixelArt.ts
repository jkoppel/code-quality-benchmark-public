import { useState, useEffect, useRef, ChangeEvent, MouseEvent } from 'react';
import { RGB, PixelGrid } from '../types';
import {
  createEmptyGrid,
  drawPixelGrid,
  imageDataToGrid,
} from '../utils/canvasUtils';
import { loadImageFromFile, saveCanvasAsBitmap } from '../utils/fileUtils';
import {
  GRID_SIZE,
  PIXEL_SIZE,
  DEFAULT_COLOR,
} from '../constants';

export default function usePixelArt() {
  // State
  const [selectedColor, setSelectedColor] = useState<RGB>({ r: 0, g: 0, b: 0 });
  const [pixels, setPixels] = useState<PixelGrid>(
    () => createEmptyGrid(DEFAULT_COLOR)
  );
  const [error, setError] = useState<string | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re‐draw whenever pixel data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawPixelGrid(ctx, pixels);
  }, [pixels]);

  // Handlers
  function handleCanvasClick(e: MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / PIXEL_SIZE);
    const row = Math.floor(y / PIXEL_SIZE);

    if (
      row >= 0 &&
      row < GRID_SIZE &&
      col >= 0 &&
      col < GRID_SIZE
    ) {
      setPixels((prev) => {
        const copy = prev.map((r) => r.slice());
        copy[row][col] = `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`;
        return copy;
      });
    }
  }

  function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveCanvasAsBitmap(canvas, 'pixel-art.png');
  }

  async function handleLoadFile(e: ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const img = await loadImageFromFile(file);
      // draw to offscreen canvas at 1px per cell
      const temp = document.createElement('canvas');
      temp.width = GRID_SIZE;
      temp.height = GRID_SIZE;
      const tctx = temp.getContext('2d');
      if (!tctx) throw new Error('Cannot get temp canvas context');
      tctx.drawImage(img, 0, 0, GRID_SIZE, GRID_SIZE);
      const data = tctx.getImageData(0, 0, GRID_SIZE, GRID_SIZE);
      setPixels(imageDataToGrid(data));
    } catch (err: any) {
      setError(err.message || 'Unknown error loading image');
    } finally {
      // reset input so same file can be loaded again
      e.target.value = '';
    }
  }

  function triggerFileLoad() {
    fileInputRef.current?.click();
  }

  return {
    selectedColor,
    setSelectedColor,
    pixels,
    canvasRef,
    fileInputRef,
    error,
    handleCanvasClick,
    handleSave,
    handleLoadFile,
    triggerFileLoad,
  };
}
