interface ProcessedImageResult {
  hex: string;
  width: number;
  height: number;
  previewUrl: string;
}

interface ProcessImageOptions {
  targetWidth?: number;
  targetHeight?: number;
}

export const processImageForCard = (
  file: File,
  options: ProcessImageOptions = {},
): Promise<ProcessedImageResult> => {
  const { targetWidth = 64, targetHeight = 64 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (!event.target?.result || typeof event.target.result !== 'string') {
        reject(new Error('Failed to read file'));
        return;
      }

      const img = new Image();

      img.onload = () => {
        try {
          // 1. Tạo Canvas để resize (ví dụ 64x64 pixels - kích thước avatar trên thẻ)
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Vẽ ảnh lên canvas (tự động resize)
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // 2. Lấy dữ liệu pixel thô (RGBA)
          const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
          const data = imageData.data; // Mảng [R, G, B, A, R, G, B, A...]

          // 3. Convert sang Grayscale và Hex
          const hexString = convertToGrayscaleHex(data);

          // 4. Cập nhật lại dữ liệu pixel đã chuyển sang Grayscale (cho preview)
          ctx.putImageData(imageData, 0, 0);

          resolve({
            hex: hexString,
            width: targetWidth,
            height: targetHeight,
            previewUrl: canvas.toDataURL(), // Để hiển thị xem trước
          });
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Convert RGBA pixel data to grayscale hex string
 * @param data - RGBA pixel data array
 * @returns Hex string representation of grayscale image
 */
const convertToGrayscaleHex = (data: Uint8ClampedArray): string => {
  let hexString = '';

  // Duyệt qua từng pixel (mỗi pixel chiếm 4 bytes R-G-B-A)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Công thức chuẩn chuyển RGB sang Grayscale (Luminosity)
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    // Chuyển giá trị gray (0-255) sang Hex 2 ký tự
    const hex = gray.toString(16).padStart(2, '0').toUpperCase();
    hexString += hex;

    // B. Ghi ngược màu xám vào dữ liệu Pixel (Cho Preview)
    data[i] = gray; // R = gray
    data[i + 1] = gray; // G = gray
    data[i + 2] = gray; // B = gray
    // data[i + 3] là Alpha (độ trong suốt), giữ nguyên hoặc set 255
  }

  return hexString;
};
