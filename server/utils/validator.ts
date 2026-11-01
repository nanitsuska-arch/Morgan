import { URL } from 'url';

// Allowed hostnames for TikTok video URLs
const TIKTOK_DOMAINS = [
  'tiktok.com',
  'www.tiktok.com',
  'vm.tiktok.com',
  'vt.tiktok.com',
  'm.tiktok.com',
  't.tiktok.com',
  'v.douyin.com',
  'douyin.com',
  'www.douyin.com',
];

// Domains permitted for proxying / downloading media (SSRF protection)
const ALLOWED_MEDIA_DOMAINS = [
  'tikwm.com',
  'www.tikwm.com',
  'tiktok.com',
  'tiktokcdn.com',
  'tiktokcdn-us.com',
  'byteoversea.com',
  'ibytedtos.com',
  'musical.ly',
  'akamaized.net',
];

/**
 * Validates whether the given string is a valid TikTok URL
 */
export function isValidTikTokUrl(rawUrl: string): { valid: boolean; normalizedUrl?: string; error?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmed = rawUrl.trim();

  // Try parsing the URL
  let parsed: URL;
  try {
    let candidate = trimmed;
    if (!candidate.startsWith('http://') && !candidate.startsWith('https://')) {
      candidate = 'https://' + candidate;
    }
    parsed = new URL(candidate);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Check protocols
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP and HTTPS protocols are supported' };
  }

  const hostname = parsed.hostname.toLowerCase();

  const isTikTokDomain = TIKTOK_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith('.' + domain)
  );

  if (!isTikTokDomain) {
    return {
      valid: false,
      error: 'Please provide a valid TikTok URL (e.g. https://www.tiktok.com/@user/video/... or https://vm.tiktok.com/...)',
    };
  }

  // Ensure path is not empty/root (e.g. https://www.tiktok.com/ is not a video URL)
  if (!parsed.pathname || parsed.pathname === '/' || parsed.pathname.length <= 1) {
    return {
      valid: false,
      error: 'Please provide a direct link to a TikTok video, not just the homepage.',
    };
  }

  return { valid: true, normalizedUrl: parsed.toString() };
}

/**
 * SSRF validation: Checks whether the given download/media URL is permitted to be fetched.
 * Protects against internal IP requests (127.0.0.1, 10.*, 192.168.*, 169.254.*, etc.).
 */
export function isSafeMediaUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    // Disallow credentials in media URLs (e.g. http://user:pass@host/)
    if (parsed.username || parsed.password) {
      return false;
    }

    // Disallow non-standard ports to prevent port scanning or intranet hitting
    if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // Disallow loopback, private IPs, link-local, and metadata services
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      host.startsWith('172.16.') ||
      host.startsWith('172.17.') ||
      host.startsWith('172.18.') ||
      host.startsWith('172.19.') ||
      host.startsWith('172.2') ||
      host.startsWith('172.3') ||
      host.endsWith('.internal') ||
      host.endsWith('.local')
    ) {
      return false;
    }

    // Check if host matches allowed domains
    const isAllowed = ALLOWED_MEDIA_DOMAINS.some(
      (domain) => host === domain || host.endsWith('.' + domain)
    );

    return isAllowed;
  } catch {
    return false;
  }
}

/**
 * Format bytes into human readable string
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}
