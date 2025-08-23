import React from 'react';

interface Props {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

const FileLoader: React.FC<Props> = ({ fileInputRef, onChange }) => (
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={onChange}
    style={{ display: 'none' }}
  />
);

export default FileLoader;
