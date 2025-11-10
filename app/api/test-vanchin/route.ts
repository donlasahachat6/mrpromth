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

    // Test Vanchin API call using OpenAI-compatible format
    // Based on official documentation
    // The base URL already includes the endpoint path
    const url = baseUrl;
    
    console.log('[Test Vanchin] Testing with:', { url, endpoint });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: endpoint, // Use endpoint ID as model parameter
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Say hello in Thai' }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    });

    const responseText = await response.text();
    let parsedResponse = null;
    
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      // Response is not JSON
    }
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      url,
      baseUrl,
      endpoint,
      response: parsedResponse || responseText.substring(0, 500),
      headers: Object.fromEntries(response.headers.entries())
    });

  } catch (error: any) {
    console.error('[Test Vanchin] Error:', error);
    return NextResponse.json({
      error: 'Exception occurred',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
