import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envVars = {
    VANCHIN_BASE_URL: (process.env.VANCHIN_BASE_URL || 'NOT SET').trim(),
    VANCHIN_BASE_URL_RAW: process.env.VANCHIN_BASE_URL || 'NOT SET',
    VANCHIN_API_KEY_1: process.env.VANCHIN_API_KEY_1 ? 'SET (hidden)' : 'NOT SET',
    VANCHIN_ENDPOINT_1: (process.env.VANCHIN_ENDPOINT_1 || 'NOT SET').trim(),
    VANCHIN_ENDPOINT_1_RAW: process.env.VANCHIN_ENDPOINT_1 || 'NOT SET',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET',
    
    // Count how many Vanchin keys are set
    totalVanchinKeys: (() => {
      let count = 0;
      for (let i = 1; i <= 39; i++) {
        if (process.env[`VANCHIN_API_KEY_${i}`]) count++;
      }
      return count;
    })(),
    
    totalVanchinEndpoints: (() => {
      let count = 0;
      for (let i = 1; i <= 39; i++) {
        if (process.env[`VANCHIN_ENDPOINT_${i}`]) count++;
      }
      return count;
    })()
  };

  return NextResponse.json(envVars);
}
