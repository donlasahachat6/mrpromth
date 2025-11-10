/**
 * Supabase Storage Helper
 * Handles file uploads and management in Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface UploadResult {
  url: string;
  path: string;
  bucket: string;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  filePath: string,
  bucket: string = 'files',
  storagePath?: string
): Promise<UploadResult> {
  try {
    // Read file
    const fileBuffer = await readFile(filePath);
    
    // Generate storage path if not provided
    const fileName = filePath.split('/').pop() || 'file';
    const finalPath = storagePath || `uploads/${Date.now()}_${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(finalPath, fileBuffer, {
        contentType: getContentType(fileName),
        upsert: false
      });
    
    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(finalPath);
    
    return {
      url: urlData.publicUrl,
      path: finalPath,
      bucket
    };
  } catch (error: any) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Upload buffer to Supabase Storage
 */
export async function uploadBuffer(
  buffer: Buffer,
  fileName: string,
  bucket: string = 'files',
  storagePath?: string
): Promise<UploadResult> {
  try {
    // Generate storage path if not provided
    const finalPath = storagePath || `uploads/${Date.now()}_${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(finalPath, buffer, {
        contentType: getContentType(fileName),
        upsert: false
      });
    
    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(finalPath);
    
    return {
      url: urlData.publicUrl,
      path: finalPath,
      bucket
    };
  } catch (error: any) {
    throw new Error(`Failed to upload buffer: ${error.message}`);
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
  path: string,
  bucket: string = 'files'
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error: any) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * List files in a bucket
 */
export async function listFiles(
  bucket: string = 'files',
  path: string = ''
): Promise<any[]> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);
    
    if (error) {
      throw new Error(`List failed: ${error.message}`);
    }
    
    return data || [];
  } catch (error: any) {
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

/**
 * Get file content type based on extension
 */
function getContentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  const contentTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Text
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
    'xml': 'application/xml',
    
    // Archives
    'zip': 'application/zip',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    
    // Video
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'avi': 'video/x-msvideo',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg'
  };
  
  return contentTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Create storage bucket if it doesn't exist
 */
export async function createBucket(
  bucket: string,
  options: {
    public?: boolean;
    fileSizeLimit?: number;
    allowedMimeTypes?: string[];
  } = {}
): Promise<void> {
  try {
    const { data, error } = await supabase.storage.createBucket(bucket, {
      public: options.public ?? true,
      fileSizeLimit: options.fileSizeLimit,
      allowedMimeTypes: options.allowedMimeTypes
    });
    
    if (error && !error.message.includes('already exists')) {
      throw new Error(`Create bucket failed: ${error.message}`);
    }
  } catch (error: any) {
    if (!error.message.includes('already exists')) {
      throw new Error(`Failed to create bucket: ${error.message}`);
    }
  }
}
