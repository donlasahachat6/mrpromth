import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('[Simple Test] Received request');
  
  try {
    const body = await request.json();
    console.log('[Simple Test] Body:', body);
    
    // Return simple streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = ['สวัสดี', 'ครับ', 'นี่', 'คือ', 'การ', 'ทดสอบ', 'แบบ', 'ง่าย'];
        
        for (const word of words) {
          const data = `data: ${JSON.stringify({ content: word + ' ' })}\n\n`;
          controller.enqueue(encoder.encode(data));
          await new Promise(resolve => setTimeout(resolve, 200));
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
    console.error('[Simple Test] Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Simple test API is working' });
}
