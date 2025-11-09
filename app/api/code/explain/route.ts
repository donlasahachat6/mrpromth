import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'code and language are required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert programmer. Explain code clearly and concisely in Thai.'
        },
        {
          role: 'user',
          content: `Explain this ${language} code:\n\n${code}`
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    const explanation = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ explanation });

  } catch (error: any) {
    console.error('Code explanation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
