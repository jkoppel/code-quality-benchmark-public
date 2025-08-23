import React, { forwardRef } from 'react';

interface ToolBarProps {
  onSave: () => void;
  onLoadClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ToolBar = forwardRef<HTMLInputElement, ToolBarProps>(
  ({ onSave, onLoadClick, onFileChange }, ref) => {
    return (
      <div className="controls">
        <button onClick={onSave}>Save as Bitmap</button>
        <button onClick={onLoadClick}>Load Bitmap</button>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
      </div>
    );
  }
);

ToolBar.displayName = 'ToolBar';

export default ToolBar;