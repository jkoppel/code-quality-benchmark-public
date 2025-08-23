import React from 'react';
import { PixelGrid } from '../../types';
import './FileControls.css';

interface FileControlsProps {
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
}

/**
 * FileControls component following Single Responsibility Principle
 * Handles file operations UI (save, load, clear)
 */
export const FileControls: React.FC<FileControlsProps> = ({
  onSave,
  onLoad,
  onClear,
  fileInputRef,
  onFileChange,
  isLoading = false
}) => {
  return (
    <div className=\"file-controls\">
      <div className=\"controls-section\">
        <h4>File Operations</h4>
        <div className=\"controls-buttons\">
          <button 
            onClick={onSave}
            className=\"control-button save-button\"
            disabled={isLoading}
            type=\"button\"
          >
            {isLoading ? 'Saving...' : 'Save as Bitmap'}
          </button>
          
          <button 
            onClick={onLoad}
            className=\"control-button load-button\"
            disabled={isLoading}
            type=\"button\"
          >
            Load Bitmap
          </button>
          
          <button 
            onClick={onClear}
            className=\"control-button clear-button\"
            disabled={isLoading}
            type=\"button\"
          >
            Clear Canvas
          </button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type=\"file\"
        accept=\"image/*\"
        onChange={onFileChange}
        className=\"hidden-file-input\"
        aria-label=\"Select image file to load\"
      />
    </div>
  );
};