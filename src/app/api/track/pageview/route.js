import { NextResponse } from 'next/server';
import { getClientIp } from '@/utils/getClientIp';
import logger from '@/utils/logger';

/**
 * POST /api/track/pageview
 * Logs page visits with client IP
 */
export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const { page, userAgent } = await request.json();
    
    // Extract useful info from user agent
    const isBot = /bot|crawler|spider|scraper/i.test(userAgent || '');
    const isProgrammatic = isBot || !/Mozilla/i.test(userAgent || '');
    
    const accessType = isProgrammatic ? 'PROGRAMMATIC' : 'BROWSER';
    
    logger.info(`Page view: ${page} | IP: ${ip} | Type: ${accessType}`);
    
    if (isBot) {
      logger.info(`Bot detected: ${userAgent}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Silent fail - don't break the page if logging fails
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
