/**
 * Extract client IP from request headers
 * Supports various proxy headers including Cloudflare
 * @param {Request} request - Next.js request object
 * @returns {string} Client IP address
 */
export function getClientIp(request) {
  // Check Cloudflare header first (if using Cloudflare)
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  // Check x-forwarded-for (standard proxy header)
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // x-forwarded-for can be a comma-separated list, take the first one
    return xForwardedFor.split(',')[0].trim();
  }

  // Check x-real-ip (nginx proxy)
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) return xRealIp;

  // Fallback to remote address (not available in Next.js edge runtime)
  return 'unknown';
}
