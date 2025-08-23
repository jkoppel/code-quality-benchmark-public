import { GRID_SIZE } from '../constants';

/**
 * Reads a File (from <input type="file">) and returns an HTMLImageElement.
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Not an image file'));
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image load error'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Given a canvas, grabs a 1px-per-grid-cell thumbnail,
 * converts to blob, and triggers a download.
 */
export function saveCanvasAsBitmap(
  original: HTMLCanvasElement,
  fileName = 'pixel-art.png'
) {
  // create downscaled canvas
  const temp = document.createElement('canvas');
  temp.width = GRID_SIZE;
  temp.height = GRID_SIZE;
  const tctx = temp.getContext('2d');
  if (!tctx) return;

  tctx.drawImage(original, 0, 0, GRID_SIZE, GRID_SIZE);

  temp.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
