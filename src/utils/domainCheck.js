'use client';

/**
 * Check if the IP address is a private IP
 * Private IP ranges:
 * - 10.0.0.0 to 10.255.255.255 (10.0.0.0/8)
 * - 172.16.0.0 to 172.31.255.255 (172.16.0.0/12)
 * - 192.168.0.0 to 192.168.255.255 (192.168.0.0/16)
 * - 127.0.0.0 to 127.255.255.255 (loopback)
 */
function isPrivateIP(ip) {
  const parts = ip.split('.').map(Number);
  
  // Invalid IP format
  if (parts.length !== 4 || parts.some(isNaN)) {
    return false;
  }

  // Check private IP ranges
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 127) return true; // loopback

  return false;
}

/**
 * Check if the current domain is an official maps4fs domain or a private IP
 * Official domains: maps4fs.xyz, www.maps4fs.xyz
 * Also allows: localhost and all private IPs (10.x.x.x, 172.16-31.x.x, 192.168.x.x, 127.x.x.x)
 */
export function isOfficialDomain() {
  // Return true during server-side rendering
  if (typeof window === 'undefined') {
    return true;
  }

  const hostname = window.location.hostname.toLowerCase();
  
  const officialDomains = [
    'maps4fs.xyz',
    'www.maps4fs.xyz',
    'localhost'
  ];

  // Check if it's an official domain
  if (officialDomains.includes(hostname)) {
    return true;
  }

  // Check if it's a private IP
  return isPrivateIP(hostname);
}

/**
 * Get the current hostname
 */
export function getCurrentHostname() {
  if (typeof window === 'undefined') {
    return 'server';
  }
  return window.location.hostname;
}
