"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/lib/checker/index.ts
var import_dns = __toESM(require("dns"));
var import_net = __toESM(require("net"));
var import_tls = __toESM(require("tls"));
async function resolveLocal(domain, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs);
    import_dns.default.resolve4(domain, (err, addresses) => {
      clearTimeout(timer);
      if (err) {
        if (err.code === "ENOTFOUND") return resolve([]);
        return reject(err);
      }
      resolve(addresses);
    });
  });
}
async function resolveDoH(domain, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, {
      headers: { accept: "application/dns-json" },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`DoH failed with status ${res.status}`);
    const data = await res.json();
    if (data.Status === 0 && data.Answer) {
      return data.Answer.filter((a) => a.type === 1).map((a) => a.data);
    }
    return [];
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}
async function testTcpConnect(host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const socket = new import_net.default.Socket();
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("TIMEOUT"));
    }, timeoutMs);
    socket.on("error", (err) => {
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
async function testTlsHandshake(host, servername, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs);
    const socket = import_tls.default.connect({
      host,
      port: 443,
      servername,
      // SNI
      rejectUnauthorized: false
      // We only care if connection drops, not if cert is fully valid here
    });
    socket.on("secureConnect", () => {
      clearTimeout(timer);
      socket.destroy();
      resolve();
    });
    socket.on("error", (err) => {
      clearTimeout(timer);
      socket.destroy();
      reject(err);
    });
  });
}
async function followHttp(url, signatures, timeoutMs, maxRedirects = 5) {
  let currentUrl = url;
  const chain = [];
  let redirects = 0;
  while (redirects <= maxRedirects) {
    chain.push(currentUrl);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const parsedUrl = new URL(currentUrl);
      const isIp = import_net.default.isIP(parsedUrl.hostname);
      if (isIp && (parsedUrl.hostname.startsWith("10.") || parsedUrl.hostname.startsWith("192.168.") || parsedUrl.hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) || parsedUrl.hostname === "127.0.0.1" || parsedUrl.hostname === "169.254.169.254")) {
        throw new Error("SSRF_ATTEMPT");
      }
      if (signatures.hostnames.some((h) => parsedUrl.hostname.includes(h))) {
        clearTimeout(timer);
        return { status: null, chain, isBlocked: true };
      }
      const res = await fetch(currentUrl, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 PHS/1.0" }
      });
      clearTimeout(timer);
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get("location");
        if (!location) {
          return { status: res.status, chain, isBlocked: false };
        }
        currentUrl = new URL(location, currentUrl).href;
        redirects++;
        continue;
      }
      if (res.status === 200) {
        const text = await res.text();
        const lowerText = text.toLowerCase();
        if (signatures.keywords.some((k) => lowerText.includes(k.toLowerCase()))) {
          return { status: res.status, chain, isBlocked: true };
        }
      }
      return { status: res.status, chain, isBlocked: false };
    } catch (err) {
      clearTimeout(timer);
      return { status: null, chain, isBlocked: false, error: err };
    }
  }
  return { status: null, chain, isBlocked: false, error: new Error("TOO_MANY_REDIRECTS") };
}
async function runCheck(domain, signatures, timeoutMs = 7e3) {
  const result = {
    status: "UNKNOWN",
    blockType: null,
    stage: null,
    resolvedIps: { local: [], doh: [] },
    httpStatus: null,
    redirectChain: [],
    errorCode: null,
    latencyMs: null
  };
  const startTime = Date.now();
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  try {
    result.stage = "dns";
    const [localIps, dohIps] = await Promise.all([
      resolveLocal(cleanDomain, timeoutMs).catch(() => []),
      resolveDoH(cleanDomain, timeoutMs).catch(() => [])
    ]);
    result.resolvedIps = { local: localIps, doh: dohIps };
    if (dohIps.length === 0) {
      result.status = "DOWN";
      result.errorCode = "ENOTFOUND";
      result.latencyMs = Date.now() - startTime;
      return result;
    }
    const hitBlockIp = localIps.find((ip) => signatures.ips.includes(ip));
    if (hitBlockIp) {
      result.status = "BLOCKED";
      result.blockType = "DNS";
      result.latencyMs = Date.now() - startTime;
      return result;
    }
    if (localIps.length === 0 && dohIps.length > 0) {
      result.status = "BLOCKED";
      result.blockType = "DNS";
      result.errorCode = "NXDOMAIN_SPOOF";
      result.latencyMs = Date.now() - startTime;
      return result;
    }
    const targetIp = localIps.length > 0 ? localIps[0] : dohIps[0];
    result.stage = "tcp";
    try {
      await testTcpConnect(targetIp, 443, timeoutMs);
    } catch (err) {
      if (err.code === "ECONNRESET") {
        result.status = "BLOCKED";
        result.blockType = "IP";
        result.errorCode = "ECONNRESET";
        result.latencyMs = Date.now() - startTime;
        return result;
      }
      result.status = "DOWN";
      result.errorCode = err.message === "TIMEOUT" ? "TIMEOUT" : err.code;
      result.latencyMs = Date.now() - startTime;
      return result;
    }
    result.stage = "tls";
    try {
      await testTlsHandshake(targetIp, cleanDomain, timeoutMs);
    } catch (err) {
      if (err.code === "ECONNRESET") {
        result.status = "BLOCKED";
        result.blockType = "SNI";
        result.errorCode = "ECONNRESET";
        result.latencyMs = Date.now() - startTime;
        return result;
      }
      result.status = "DOWN";
      result.errorCode = err.message === "TIMEOUT" ? "TIMEOUT" : err.code;
      result.latencyMs = Date.now() - startTime;
      return result;
    }
    result.stage = "http";
    const httpRes = await followHttp(`https://${cleanDomain}`, signatures, timeoutMs);
    result.httpStatus = httpRes.status;
    result.redirectChain = httpRes.chain;
    if (httpRes.isBlocked) {
      result.status = "BLOCKED";
      result.blockType = "HTTP";
      result.latencyMs = Date.now() - startTime;
      return result;
    }
    if (httpRes.error) {
      result.status = "DOWN";
      result.errorCode = httpRes.error.message === "TIMEOUT" ? "TIMEOUT" : httpRes.error.code;
      result.latencyMs = Date.now() - startTime;
      return result;
    }
    if (httpRes.status && httpRes.status >= 500) {
      result.status = "DOWN";
      result.errorCode = `HTTP_${httpRes.status}`;
      result.latencyMs = Date.now() - startTime;
      return result;
    }
    result.status = "ONLINE";
    result.latencyMs = Date.now() - startTime;
    return result;
  } catch (error) {
    result.status = "ERROR";
    result.errorCode = error.message;
    result.latencyMs = Date.now() - startTime;
    return result;
  }
}

// src/probe-worker/index.ts
var API_URL = process.env.API_URL;
var PROBE_TOKEN = process.env.PROBE_TOKEN;
var INTERVAL_MS = parseInt(process.env.INTERVAL_MS || "60000", 10);
if (!API_URL || !PROBE_TOKEN) {
  console.error("Missing API_URL or PROBE_TOKEN environment variables.");
  process.exit(1);
}
async function fetchJobs() {
  const res = await fetch(`${API_URL}/api/probe/jobs`, {
    headers: { "Authorization": `Bearer ${PROBE_TOKEN}` }
  });
  if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`);
  return res.json();
}
async function postResults(results) {
  const res = await fetch(`${API_URL}/api/probe/results`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PROBE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ results })
  });
  if (!res.ok) throw new Error(`Failed to post results: ${res.status}`);
  return res.json();
}
async function run() {
  console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] Fetching jobs from ${API_URL}...`);
  try {
    const { probe, websites, signatures } = await fetchJobs();
    console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] Found ${websites.length} websites to check.`);
    const results = [];
    for (const site of websites) {
      console.log(`Checking ${site.url}...`);
      const checkResult = await runCheck(site.url, signatures);
      results.push({
        websiteId: site.id,
        ...checkResult,
        checkedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (results.length > 0) {
      console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] Posting ${results.length} results...`);
      await postResults(results);
      console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] Results posted successfully.`);
    }
  } catch (error) {
    console.error(`[${(/* @__PURE__ */ new Date()).toISOString()}] Error:`, error.message);
  }
}
async function loop() {
  await run();
  setTimeout(loop, INTERVAL_MS);
}
console.log("Starting PHS Probe Worker...");
loop();
