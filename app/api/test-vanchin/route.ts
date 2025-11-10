import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const baseUrl = (process.env.VANCHIN_BASE_URL || '').trim();
    const apiKey = (process.env.VANCHIN_API_KEY_1 || '').trim();
    const endpoint = (process.env.VANCHIN_ENDPOINT_1 || '').trim();

    if (!baseUrl || !apiKey || !endpoint) {
      return NextResponse.json({
        error: 'Missing configuration',
        baseUrl: baseUrl || 'NOT SET',
        hasApiKey: !!apiKey,
        endpoint: endpoint || 'NOT SET'
      }, { status: 500 });
    }

    // Test Vanchin API call
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: endpoint,
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Say hello in Thai' }
        ],
        max_tokens: 50
      })
    });

    const responseText = await response.text();
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      baseUrl,
      endpoint,
      responsePreview: responseText.substring(0, 500),
      headers: Object.fromEntries(response.headers.entries())
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Exception occurred',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
