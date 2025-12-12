import { NextResponse } from 'next/server';
import { getClientIp } from '@/utils/getClientIp';
import logger from '@/utils/logger';

/**
 * POST /api/track/generate
 * Logs when user clicks the generate button
 */
export async function POST(request) {
  try {
    const ip = getClientIp(request);
    
    logger.info(`Generate button clicked | IP: ${ip}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Silent fail - don't break generation if logging fails
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
