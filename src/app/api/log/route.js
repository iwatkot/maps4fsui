import { NextResponse } from 'next/server';
import logger from '@/utils/logger';
import { getClientIp } from '@/utils/getClientIp';

export async function POST(request) {
  try {
    // Disabled - only specific tracking endpoints should log
    // const { level, message, data } = await request.json();
    // const ip = getClientIp(request);
    
    // Format for terminal output
    // const timestamp = new Date().toISOString();
    // const logEntry = {
    //   timestamp,
    //   level: `CLIENT-${level}`,
    //   ip,
    //   message,
    //   ...(data && { data })
    // };
     
    // Log to server console (will appear in terminal)
    // console.log(JSON.stringify(logEntry));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Logging failed' }, { status: 500 });
  }
}