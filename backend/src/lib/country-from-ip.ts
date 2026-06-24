import type { Request } from 'express';
import geoip from 'geoip-lite';
import { getClientIp } from './client-ip';

const PRIVATE_IP =
  /^(?:127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|::1$|fc00:|fd)/;

function normalizeIp(ip: string): string {
  return ip.replace(/^::ffff:/, '').trim();
}

function isPrivateOrLocalIp(ip: string): boolean {
  const normalized = normalizeIp(ip);
  return normalized === 'unknown' || PRIVATE_IP.test(normalized);
}

/** ISO 3166-1 alpha-2 country code from IP, or null when unknown/local. */
export function getCountryFromIp(ip: string): string | null {
  if (!ip || isPrivateOrLocalIp(ip)) return null;

  const lookup = geoip.lookup(normalizeIp(ip));
  const code = lookup?.country?.toUpperCase();
  if (!code || code.length !== 2 || code === 'XX') return null;
  return code;
}

/** Prefer Cloudflare country header, then GeoIP lookup from the request. */
export function getCountryFromRequest(req: Request): string | null {
  const cfCountry = req.headers['cf-ipcountry'];
  if (typeof cfCountry === 'string') {
    const code = cfCountry.trim().toUpperCase();
    if (code.length === 2 && code !== 'XX') return code;
  }

  return getCountryFromIp(getClientIp(req));
}
