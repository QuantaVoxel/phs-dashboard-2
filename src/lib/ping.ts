import { prisma } from "@/lib/prisma";

export async function pingWebsiteCore(websiteId: string) {
  const website = await prisma.website.findUnique({ where: { id: websiteId } });
  if (!website) throw new Error("Website not found");

  let status: "ONLINE" | "OFFLINE" | "NOT_FOUND" | "BLOCKED" | "ERROR" | "UNKNOWN" = "ONLINE";
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(`https://${website.url}`, { 
      signal: controller.signal,
      redirect: 'follow',
      method: 'HEAD'
    }).catch(err => fetch(`http://${website.url}`, {
      signal: controller.signal,
      redirect: 'follow',
      method: 'HEAD'
    }));
    
    clearTimeout(timeoutId);

    if (!response) {
      status = "OFFLINE";
    } else if (response.status === 404) {
      status = "NOT_FOUND";
    } else if (response.status === 403) {
      status = "BLOCKED";
    } else if (response.status >= 500) {
      status = "OFFLINE";
    } else {
      status = "ONLINE";
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      status = "ERROR";
    } else if (error.code === 'ENOTFOUND' || error.message.includes('fetch failed')) {
      status = "ERROR";
    } else {
      status = "OFFLINE";
    }
  }

  const timestamp = new Date();
  const changed = website.status !== status && website.status !== 'UNKNOWN';

  await prisma.website.update({
    where: { id: websiteId },
    data: { status, lastCheckedAt: timestamp }
  });

  return { changed, newStatus: status, oldStatus: website.status };
}
