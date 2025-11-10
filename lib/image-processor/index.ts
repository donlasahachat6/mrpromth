/**
 * Image Processing Library
 * Handles OCR, image description, resizing, and conversion
 */

import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

export interface ImageDescription {
  description: string;
  objects: string[];
  colors: string[];
  scene: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  colorSpace: string;
  hasAlpha: boolean;
}

/**
 * Perform OCR on an image
 */
export async function performOCR(imagePath: string, lang: string = 'eng'): Promise<OCRResult> {
  const worker = await createWorker(lang);
  
  try {
    const { data } = await worker.recognize(imagePath);
    
    return {
      text: data.text,
      confidence: data.confidence,
      words: (data as any).words?.map((word: any) => ({
        text: word.text,
        confidence: word.confidence,
        bbox: word.bbox
      })) || []
    };
  } finally {
    await worker.terminate();
  }
}

/**
 * Generate image description using GPT-4 Vision
 */
export async function describeImage(imagePath: string): Promise<ImageDescription> {
  // Read image and convert to base64
  const imageBuffer = await sharp(imagePath).toBuffer();
  const base64Image = imageBuffer.toString('base64');
  
  // Call OpenAI GPT-4 Vision API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this image in detail. Include: 1) Main description, 2) Objects detected, 3) Dominant colors, 4) Scene/setting. Return as JSON with keys: description, objects (array), colors (array), scene.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Try to parse JSON response
  try {
    const parsed = JSON.parse(content);
    return {
      description: parsed.description || content,
      objects: parsed.objects || [],
      colors: parsed.colors || [],
      scene: parsed.scene || ''
    };
  } catch {
    // If not JSON, return as description
    return {
      description: content,
      objects: [],
      colors: [],
      scene: ''
    };
  }
}

/**
 * Get image metadata
 */
export async function getImageMetadata(imagePath: string): Promise<ImageMetadata> {
  const metadata = await sharp(imagePath).metadata();
  const stats = await sharp(imagePath).stats();
  
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: metadata.size || 0,
    colorSpace: metadata.space || 'unknown',
    hasAlpha: metadata.hasAlpha || false
  };
}

/**
 * Resize image
 */
export async function resizeImage(
  inputPath: string,
  outputPath: string,
  width?: number,
  height?: number,
  options: {
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}
): Promise<{ width: number; height: number; size: number }> {
  const { fit = 'cover', quality = 80, format } = options;
  
  let pipeline = sharp(inputPath).resize(width, height, { fit });
  
  // Apply format conversion if specified
  if (format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality });
  } else if (format === 'png') {
    pipeline = pipeline.png({ quality });
  } else if (format === 'webp') {
    pipeline = pipeline.webp({ quality });
  }
  
  const info = await pipeline.toFile(outputPath);
  
  return {
    width: info.width,
    height: info.height,
    size: info.size
  };
}

/**
 * Convert image format
 */
export async function convertImage(
  inputPath: string,
  outputPath: string,
  format: 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff',
  options: {
    quality?: number;
    compression?: number;
  } = {}
): Promise<{ format: string; size: number }> {
  const { quality = 80, compression = 6 } = options;
  
  let pipeline = sharp(inputPath);
  
  switch (format) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality });
      break;
    case 'png':
      pipeline = pipeline.png({ quality, compressionLevel: compression });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality });
      break;
    case 'tiff':
      pipeline = pipeline.tiff({ quality });
      break;
  }
  
  const info = await pipeline.toFile(outputPath);
  
  return {
    format: info.format,
    size: info.size
  };
}

/**
 * Apply image transformations
 */
export async function transformImage(
  inputPath: string,
  outputPath: string,
  transformations: {
    rotate?: number;
    flip?: boolean;
    flop?: boolean;
    grayscale?: boolean;
    blur?: number;
    sharpen?: boolean;
    brightness?: number;
    contrast?: number;
    saturation?: number;
  }
): Promise<void> {
  let pipeline = sharp(inputPath);
  
  if (transformations.rotate) {
    pipeline = pipeline.rotate(transformations.rotate);
  }
  
  if (transformations.flip) {
    pipeline = pipeline.flip();
  }
  
  if (transformations.flop) {
    pipeline = pipeline.flop();
  }
  
  if (transformations.grayscale) {
    pipeline = pipeline.grayscale();
  }
  
  if (transformations.blur) {
    pipeline = pipeline.blur(transformations.blur);
  }
  
  if (transformations.sharpen) {
    pipeline = pipeline.sharpen();
  }
  
  if (transformations.brightness !== undefined) {
    pipeline = pipeline.modulate({ brightness: transformations.brightness });
  }
  
  if (transformations.contrast !== undefined) {
    pipeline = pipeline.linear(transformations.contrast, 0);
  }
  
  if (transformations.saturation !== undefined) {
    pipeline = pipeline.modulate({ saturation: transformations.saturation });
  }
  
  await pipeline.toFile(outputPath);
}

/**
 * Create thumbnail
 */
export async function createThumbnail(
  inputPath: string,
  outputPath: string,
  size: number = 200,
  format: 'jpeg' | 'png' | 'webp' = 'jpeg'
): Promise<void> {
  await sharp(inputPath)
    .resize(size, size, { fit: 'cover' })
    .toFormat(format)
    .toFile(outputPath);
}

/**
 * Extract dominant colors from image
 */
export async function extractColors(imagePath: string, count: number = 5): Promise<string[]> {
  const { data, info } = await sharp(imagePath)
    .resize(100, 100)
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  // Simple color extraction using pixel sampling
  const colors: Map<string, number> = new Map();
  const channels = info.channels || 3;
  
  // Sample pixels and count color occurrences
  for (let i = 0; i < data.length; i += channels * 10) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Convert to hex
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    colors.set(hex, (colors.get(hex) || 0) + 1);
  }
  
  // Sort by frequency and return top N colors
  return Array.from(colors.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([color]) => color);
}
