import { prisma } from "@/lib/prisma";
import { runCheck } from "./checker";
import { BlockSignatures } from "./checker/types";

export async function pingWebsiteCore(websiteId: string) {
  const website = await prisma.website.findUnique({ where: { id: websiteId } });
  if (!website) throw new Error("Website not found");

  // Get signatures
  const sigs = await prisma.blockSignature.findMany({ where: { isActive: true } });
  const signatures: BlockSignatures = {
    ips: sigs.filter(s => s.type === 'IP').map(s => s.value),
    hostnames: sigs.filter(s => s.type === 'HOSTNAME').map(s => s.value),
    keywords: sigs.filter(s => s.type === 'KEYWORD').map(s => s.value),
  };

  // Run the advanced checker from Global (Server)
  const result = await runCheck(website.url, signatures);

  const timestamp = new Date();
  
  // Log the check result
  await prisma.websiteCheckLog.create({
    data: {
      websiteId,
      status: result.status as any,
      blockType: result.blockType as any,
      httpStatusCode: result.httpStatus,
      responseTimeMs: result.latencyMs,
      errorMessage: result.errorCode,
      checkedAt: timestamp
    }
  });

  // Determine final status. Since this is global ping, if it's DOWN it might be truly DOWN.
  // We'll update the website's status directly.
  let finalStatus = result.status;
  let blockType = result.blockType;

  // But wait! What if there are active probes?
  // We should look at recent probe results (last 10 minutes)
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentProbes = await prisma.probeCheckResult.findMany({
    where: { websiteId, checkedAt: { gte: tenMinsAgo } },
    orderBy: { checkedAt: 'desc' }
  });

  if (recentProbes.length > 0) {
    const probe = recentProbes[0]; // Take the latest probe result
    
    // Aggregation Logic:
    if ((probe.status === 'BLOCKED' || probe.status === 'OFFLINE') && result.status === 'ONLINE') {
      finalStatus = 'BLOCKED';
      blockType = probe.blockType as any;
    } else if (probe.status === 'OFFLINE' && result.status === 'OFFLINE') {
      finalStatus = 'OFFLINE';
    } else if (probe.status === 'ONLINE' && result.status === 'ONLINE') {
      finalStatus = 'ONLINE';
    } else {
      // Fallback to global
      finalStatus = result.status;
    }
  }

  // Update website
  const changed = website.status !== finalStatus && website.status !== 'UNKNOWN';

  await prisma.website.update({
    where: { id: websiteId },
    data: { 
      status: finalStatus as any, 
      blockType: blockType as any,
      lastCheckedAt: timestamp,
      ...(changed ? { lastStatusChangeAt: timestamp } : {})
    }
  });

  return { changed, newStatus: finalStatus, oldStatus: website.status };
}
