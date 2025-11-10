import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';
import { withRateLimit } from '@/lib/utils/api-with-rate-limit';
import { RateLimiters } from '@/lib/utils/rate-limiter';

export const dynamic = 'force-dynamic';

// POST /api/files/upload - Upload file for chat
async function handlePOST(request: NextRequest, context: any) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'text/javascript',
      'application/javascript',
      'text/x-python',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type) && !file.type.startsWith('text/')) {
      return NextResponse.json(
        { error: 'File type not supported' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${user.id}/${timestamp}_${file.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('chat-files')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('chat-files')
      .getPublicUrl(filename);

    // Save file metadata to database (files table)
    const { error: dbError } = await supabase
      .from('files')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_path: filename,
        file_size: file.size,
        mime_type: file.type,
        storage_url: publicUrl,
        metadata: {
          original_name: file.name,
          uploaded_at: new Date().toISOString()
        }
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue even if database insert fails
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Apply rate limiting: 30 requests per minute for file uploads
export const POST = withRateLimit(handlePOST, RateLimiters.standard);
