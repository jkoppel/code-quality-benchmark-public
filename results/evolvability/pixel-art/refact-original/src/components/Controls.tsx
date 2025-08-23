import React from 'react';

interface Props {
  onSave: () => void;
  onLoadClick: () => void;
}

const Controls: React.FC<Props> = ({ onSave, onLoadClick }) => (
  <div className="controls">
    <button onClick={onSave}>Save as Bitmap</button>
    <button onClick={onLoadClick}>Load Bitmap</button>
  </div>
);

export default Controls;
