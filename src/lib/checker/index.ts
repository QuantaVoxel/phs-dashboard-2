import dns from 'dns';
import net from 'net';
import tls from 'tls';
import { CheckResult, BlockSignatures } from './types';

// Export runtime to force Node.js instead of Edge if imported into Next.js routes
export const runtime = 'nodejs';

/**
 * Perform DNS resolution using local system resolver.
 */
async function resolveLocal(domain: string, timeoutMs: number): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
    dns.resolve4(domain, (err, addresses) => {
      clearTimeout(timer);
      if (err) {
        // ENOTFOUND means no records, not necessarily an error if DoH also says so
        if (err.code === 'ENOTFOUND') return resolve([]);
        return reject(err);
      }
      resolve(addresses);
    });
  });
}

/**
 * Perform DNS resolution using Cloudflare DoH.
 */
async function resolveDoH(domain: string, timeoutMs: number): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, {
      headers: { accept: 'application/dns-json' },
      signal: controller.signal
    });
    clearTimeout(timer);
    
    if (!res.ok) throw new Error(`DoH failed with status ${res.status}`);
    const data = await res.json();
    
    // Status 0 is NOERROR
    if (data.Status === 0 && data.Answer) {
      return data.Answer.filter((a: any) => a.type === 1).map((a: any) => a.data);
    }
    return [];
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}

/**
 * Test TCP connection
 */
async function testTcpConnect(host: string, port: number, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('TIMEOUT'));
    }, timeoutMs);

    socket.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    socket.connect(port, host, () => {
      clearTimeout(timer);
      socket.destroy();
      resolve();
    });
  });
}

/**
 * Test TLS SNI handshake
 */
async function testTlsHandshake(host: string, servername: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
    
    const socket = tls.connect({
      host,
      port: 443,
      servername, // SNI
      rejectUnauthorized: false, // We only care if connection drops, not if cert is fully valid here
    });

    socket.on('secureConnect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve();
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      socket.destroy();
      reject(err);
    });
  });
}

/**
 * Manual HTTP Redirect Follower to detect Block Pages
 */
async function followHttp(url: string, signatures: BlockSignatures, timeoutMs: number, maxRedirects = 5): Promise<{ status: number | null, chain: string[], isBlocked: boolean, error?: Error }> {
  let currentUrl = url;
  const chain: string[] = [];
  let redirects = 0;
  
  while (redirects <= maxRedirects) {
    chain.push(currentUrl);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      // Validate IP to prevent SSRF
      const parsedUrl = new URL(currentUrl);
      const isIp = net.isIP(parsedUrl.hostname);
      if (isIp && (
          parsedUrl.hostname.startsWith('10.') || 
          parsedUrl.hostname.startsWith('192.168.') || 
          parsedUrl.hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
          parsedUrl.hostname === '127.0.0.1' || 
          parsedUrl.hostname === '169.254.169.254'
      )) {
        throw new Error('SSRF_ATTEMPT');
      }

      // Check against signature hostnames
      if (signatures.hostnames.some(h => parsedUrl.hostname.includes(h))) {
        clearTimeout(timer);
        return { status: null, chain, isBlocked: true };
      }

      const res = await fetch(currentUrl, {
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 PHS/1.0' }
      });
      clearTimeout(timer);

      // Check if redirect
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get('location');
        if (!location) {
          return { status: res.status, chain, isBlocked: false };
        }
        
        currentUrl = new URL(location, currentUrl).href;
        redirects++;
        continue;
      }

      // It's a final page, check body for keywords if status is 200
      if (res.status === 200) {
        const text = await res.text();
        const lowerText = text.toLowerCase();
        if (signatures.keywords.some(k => lowerText.includes(k.toLowerCase()))) {
          return { status: res.status, chain, isBlocked: true };
        }
      }

      return { status: res.status, chain, isBlocked: false };
      
    } catch (err: any) {
      clearTimeout(timer);
      return { status: null, chain, isBlocked: false, error: err };
    }
  }

  return { status: null, chain, isBlocked: false, error: new Error('TOO_MANY_REDIRECTS') };
}

/**
 * Main Check Execution
 */
export async function runCheck(domain: string, signatures: BlockSignatures, timeoutMs = 7000): Promise<Omit<CheckResult, 'probeId' | 'checkedAt'>> {
  const result: Omit<CheckResult, 'probeId' | 'checkedAt'> = {
    status: 'UNKNOWN',
    blockType: null,
    stage: null,
    resolvedIps: { local: [], doh: [] },
    httpStatus: null,
    redirectChain: [],
    errorCode: null,
    latencyMs: null
  };

  const startTime = Date.now();
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  try {
    // 1. DNS STAGE
    result.stage = 'dns';
    const [localIps, dohIps] = await Promise.all([
      resolveLocal(cleanDomain, timeoutMs).catch(() => [] as string[]),
      resolveDoH(cleanDomain, timeoutMs).catch(() => [] as string[])
    ]);

    result.resolvedIps = { local: localIps, doh: dohIps };

    if (dohIps.length === 0) {
      // Domain truly doesn't exist globally
      result.status = 'OFFLINE';
      result.errorCode = 'ENOTFOUND';
      result.latencyMs = Date.now() - startTime;
      return result;
    }

    // Check if local IP hits a known block IP
    const hitBlockIp = localIps.find(ip => signatures.ips.includes(ip));
    if (hitBlockIp) {
      result.status = 'BLOCKED';
      result.blockType = 'DNS';
      result.latencyMs = Date.now() - startTime;
      return result;
    }

    // If local resolves to nothing, but DoH has IPs -> DNS blocked via NXDOMAIN spoofing
    if (localIps.length === 0 && dohIps.length > 0) {
      result.status = 'BLOCKED';
      result.blockType = 'DNS';
      result.errorCode = 'NXDOMAIN_SPOOF';
      result.latencyMs = Date.now() - startTime;
      return result;
    }

    // Target IP for next stages (prefer local if it matches, else DoH)
    // Actually, to test censorship, we MUST connect to the DoH IP. If we connect to a fake IP, it might timeout.
    // Wait, if local gave us an IP, we should connect to it. If it times out or resets, it's blocked.
    const targetIp = localIps.length > 0 ? localIps[0] : dohIps[0];

    // 2. TCP STAGE
    result.stage = 'tcp';
    try {
      await testTcpConnect(targetIp, 443, timeoutMs);
    } catch (err: any) {
      // If TCP fails, and local IP was different from DoH, it might be IP blocked
      if (err.code === 'ECONNRESET') {
        result.status = 'BLOCKED';
        result.blockType = 'IP';
        result.errorCode = 'ECONNRESET';
        result.latencyMs = Date.now() - startTime;
        return result;
      }
      
      // For TIMEOUT or ECONNREFUSED, we consider it DOWN from this probe's perspective.
      // Global aggregation will decide if it's SUSPECTED_BLOCKED_IP if global succeeds.
      result.status = 'OFFLINE';
      result.errorCode = err.message === 'TIMEOUT' ? 'TIMEOUT' : err.code;
      result.latencyMs = Date.now() - startTime;
      return result;
    }

    // 3. TLS SNI STAGE
    result.stage = 'tls';
    try {
      await testTlsHandshake(targetIp, cleanDomain, timeoutMs);
    } catch (err: any) {
      if (err.code === 'ECONNRESET') {
        result.status = 'BLOCKED';
        result.blockType = 'SNI';
        result.errorCode = 'ECONNRESET';
        result.latencyMs = Date.now() - startTime;
        return result;
      }
      
      result.status = 'OFFLINE';
      result.errorCode = err.message === 'TIMEOUT' ? 'TIMEOUT' : err.code;
      result.latencyMs = Date.now() - startTime;
      return result;
    }

    // 4. HTTP STAGE
    result.stage = 'http';
    const httpRes = await followHttp(`https://${cleanDomain}`, signatures, timeoutMs);
    
    result.httpStatus = httpRes.status;
    result.redirectChain = httpRes.chain;
    
    if (httpRes.isBlocked) {
      result.status = 'BLOCKED';
      result.blockType = 'HTTP';
      result.latencyMs = Date.now() - startTime;
      return result;
    }

    if (httpRes.error) {
      result.status = 'OFFLINE';
      result.errorCode = httpRes.error.message === 'TIMEOUT' ? 'TIMEOUT' : (httpRes.error as any).code;
      result.latencyMs = Date.now() - startTime;
      return result;
    }

    if (httpRes.status && httpRes.status >= 500) {
      result.status = 'OFFLINE';
      result.errorCode = `HTTP_${httpRes.status}`;
      result.latencyMs = Date.now() - startTime;
      return result;
    }

    // Passed all stages
    result.status = 'ONLINE';
    result.latencyMs = Date.now() - startTime;
    return result;

  } catch (error: any) {
    result.status = 'ERROR';
    result.errorCode = error.message;
    result.latencyMs = Date.now() - startTime;
    return result;
  }
}
