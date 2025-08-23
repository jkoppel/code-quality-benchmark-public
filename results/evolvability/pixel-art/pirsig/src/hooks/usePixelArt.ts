import { useState, useEffect, useRef } from 'react';
import { RGB, PixelGrid } from '../types';
import { DEFAULT_RGB } from '../constants';
import { createEmptyGrid, drawPixelGrid, getGridPosition, updatePixel } from '../utils/canvasUtils';
import { rgbToString } from '../utils/colorUtils';
import { savePixelArt, loadPixelArt } from '../utils/fileUtils';

export const usePixelArt = () => {
  const [selectedColor, setSelectedColor] = useState<RGB>(DEFAULT_RGB);
  const [pixels, setPixels] = useState<PixelGrid>(createEmptyGrid);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    drawPixelGrid(canvasRef.current, pixels);
  }, [pixels]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const position = getGridPosition(canvas, e.clientX, e.clientY);
    if (position) {
      const colorString = rgbToString(selectedColor);
      setPixels(prevPixels => updatePixel(prevPixels, position, colorString));
    }
  };

  const handleSave = () => {
    savePixelArt(pixels);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    loadPixelArt(file, (newPixels) => {
      setPixels(newPixels);
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    selectedColor,
    setSelectedColor,
    pixels,
    setPixels,
    canvasRef,
    fileInputRef,
    handleCanvasClick,
    handleSave,
    handleLoad,
    triggerFileInput
  };
};