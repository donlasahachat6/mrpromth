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

    const { code, language, cursor } = await request.json();

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
          content: `You are an expert ${language} programmer. Provide code completion suggestions. Return only the completion code without explanations.`
        },
        {
          role: 'user',
          content: `Complete this ${language} code:\n\n${code}\n\nCursor position: ${cursor || 'end'}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const suggestion = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ suggestion });

  } catch (error: any) {
    console.error('Code completion error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
