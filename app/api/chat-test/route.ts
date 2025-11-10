import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  console.log('[Chat Test API] Received request');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log('[Chat Test API] User:', user?.id || 'No user');
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    console.log('[Chat Test API] Body:', JSON.stringify(body, null, 2));
    
    // Return mock streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const mockResponse = "สวัสดีครับ! นี่คือ mock response เพื่อทดสอบว่า Chat UI ทำงานได้ถูกต้อง ถ้าคุณเห็นข้อความนี้ แสดงว่า frontend และ streaming ทำงานได้ดี ปัญหาอยู่ที่ Vanchin API integration";
        
        // Stream word by word
        const words = mockResponse.split(' ');
        for (const word of words) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: word + ' ' })}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('[Chat Test API] Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
