/** Convierte cualquier imagen del navegador a WebP (Blob). */

const MAX_EDGE = 1600;
const WEBP_QUALITY = 0.82;

export type WebpResult = {
  blob: Blob;
  fileName: string;
  width: number;
  height: number;
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}

function canvasToWebpBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("El navegador no pudo generar WebP"));
          return;
        }
        resolve(blob);
      },
      "image/webp",
      quality,
    );
  });
}

function baseName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "-") || "image";
}

/** Transforma un File/Blob de imagen a WebP redimensionado. */
export async function convertImageToWebp(
  file: File,
  options?: { maxEdge?: number; quality?: number },
): Promise<WebpResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo no es una imagen");
  }

  const maxEdge = options?.maxEdge ?? MAX_EDGE;
  const quality = options?.quality ?? WEBP_QUALITY;
  const img = await loadImage(file);

  let { width, height } = img;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");

  ctx.drawImage(img, 0, 0, width, height);
  const blob = await canvasToWebpBlob(canvas, quality);

  return {
    blob,
    fileName: `${baseName(file.name)}.webp`,
    width,
    height,
  };
}
