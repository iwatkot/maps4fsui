import { NextResponse } from 'next/server';
import securityLogger from './utils/securityLogger';

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // Max requests per IP per window
const STRICT_ENDPOINTS_MAX = 20; // Stricter limit for sensitive endpoints

// Blocked IPs (add known malicious IPs here)
const BLOCKED_IPS = new Set([
  '176.117.107.158', // Known malicious IP from logs
]);

// In-memory rate limit store (use Redis in production for multi-instance deployments)
const rateLimitStore = new Map();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

function getClientIp(request) {
  // Try multiple headers as different proxies use different headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  return realIp || cfConnectingIp || request.ip || 'unknown';
}

function isStrictEndpoint(pathname) {
  // More restrictive rate limiting for sensitive operations
  return pathname.startsWith('/api/files/') || 
         pathname.startsWith('/api/maps/delete') ||
         pathname.startsWith('/api/maps/rename');
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Only apply to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const clientIp = getClientIp(request);
  
  // Block known malicious IPs
  if (BLOCKED_IPS.has(clientIp)) {
    securityLogger.blockedRequest(clientIp, 'IP on blocklist', { endpoint: pathname });
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  // Rate limiting
  const now = Date.now();
  const key = `${clientIp}:${pathname}`;
  const maxRequests = isStrictEndpoint(pathname) ? STRICT_ENDPOINTS_MAX : MAX_REQUESTS_PER_WINDOW;
  
  let rateLimitData = rateLimitStore.get(key);
  
  if (!rateLimitData || now > rateLimitData.resetTime) {
    // Create new rate limit window
    rateLimitData = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
      firstRequestTime: now
    };
  } else {
    // Increment counter
    rateLimitData.count++;
  }
  
  rateLimitStore.set(key, rateLimitData);
  
  // Check if limit exceeded
  if (rateLimitData.count > maxRequests) {
    const timeUntilReset = Math.ceil((rateLimitData.resetTime - now) / 1000);
    securityLogger.rateLimitViolation(clientIp, pathname, rateLimitData.count);
    
    return NextResponse.json(
      { 
        error: 'Too many requests', 
        retryAfter: timeUntilReset 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': timeUntilReset.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString()
        }
      }
    );
  }

  // Add rate limit headers to successful requests
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', (maxRequests - rateLimitData.count).toString());
  response.headers.set('X-RateLimit-Reset', new Date(rateLimitData.resetTime).toISOString());
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
