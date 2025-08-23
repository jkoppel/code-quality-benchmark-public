import React, { forwardRef } from 'react';
import { PixelGrid } from '../types';
import { loadImageAsPixels } from '../utils/fileUtils';

interface FileLoaderProps {
  onLoad: (pixels: PixelGrid) => void;
}

export const FileLoader = forwardRef<HTMLInputElement, FileLoaderProps>(
  ({ onLoad }, ref) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      loadImageAsPixels(file, onLoad);
      
      // Reset the input so the same file can be loaded again
      if (e.target) {
        e.target.value = '';
      }
    };

    return (
      <input
        ref={ref}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    );
  }
);

FileLoader.displayName = 'FileLoader';

