import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { level, message, data } = await request.json();
    
    // Format for terminal output
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: `CLIENT-${level}`,
      message,
      ...(data && { data })
    };
    
    // Log to server console (will appear in terminal)
    console.log(JSON.stringify(logEntry));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Logging failed' }, { status: 500 });
  }
}
