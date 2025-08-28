import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    // Server-side vars that should be mapped to client
    APP_ENV: process.env.APP_ENV || 'NOT_SET',
    BACKEND_URL: process.env.BACKEND_URL || 'NOT_SET',
    BEARER_TOKEN: process.env.BEARER_TOKEN ? '[HIDDEN]' : 'NOT_SET',
    
    // What they should become on client side
    NEXT_PUBLIC_HOSTNAME: process.env.NEXT_PUBLIC_HOSTNAME || 'NOT_SET',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'NOT_SET',
    NEXT_PUBLIC_BEARER_TOKEN: process.env.NEXT_PUBLIC_BEARER_TOKEN ? '[HIDDEN]' : 'NOT_SET',
    
    NODE_ENV: process.env.NODE_ENV,
  });
}
