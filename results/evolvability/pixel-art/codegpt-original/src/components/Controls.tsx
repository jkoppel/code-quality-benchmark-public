import React, { useRef } from 'react';
import { ControlsProps } from '../types';
import './Controls.css';

/**
 * Controls component - handles file operations and other controls
 * Follows Single Responsibility Principle - only handles control UI
 */
const Controls: React.FC<ControlsProps> = ({ 
  onSave, 
  onLoad, 
  onClear, 
  onUndo, 
  onRedo 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onLoad(file);
      // Reset the input so the same file can be loaded again
      event.target.value = '';
    }
  };

  return (
    <div className=\"controls\">
      <div className=\"control-group\">
        <h4>File Operations</h4>
        <div className=\"button-row\">
          <button 
            onClick={onSave} 
            className=\"control-button save-button\"
            title=\"Save as PNG image\"
          >
            💾 Save
          </button>
          <button 
            onClick={handleLoadClick} 
            className=\"control-button load-button\"
            title=\"Load image file\"
          >
            📁 Load
          </button>
          <input
            ref={fileInputRef}
            type=\"file\"
            accept=\"image/*\"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-label=\"File input for loading images\"
          />
        </div>
      </div>

      <div className=\"control-group\">
        <h4>Edit Operations</h4>
        <div className=\"button-row\">
          {onUndo && (
            <button 
              onClick={onUndo} 
              className=\"control-button undo-button\"
              title=\"Undo last action\"
            >
              ↶ Undo
            </button>
          )}
          {onRedo && (
            <button 
              onClick={onRedo} 
              className=\"control-button redo-button\"
              title=\"Redo last undone action\"
            >
              ↷ Redo
            </button>
          )}
          <button 
            onClick={onClear} 
            className=\"control-button clear-button\"
            title=\"Clear entire canvas\"
          >
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;