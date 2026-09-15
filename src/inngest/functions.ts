import { inngest } from "./client";
import { sendTelegramMessage, formatWebsiteAlert, formatPackageAlert } from "@/lib/telegram";
import { prisma } from "@/lib/prisma";

// Job 1a: Cron to trigger checks for all websites
export const checkAllWebsitesCron = inngest.createFunction(
  { id: "check-all-websites", triggers: { cron: "*/30 * * * *" } }, // Runs every 30 mins
  async ({ step }) => {
    // 1. Fetch all active websites
    const websites = await step.run("fetch-active-websites", async () => {
      return prisma.website.findMany({ 
        where: { isActive: true },
        select: { id: true }
      });
    });

    // 2. Fan-out: trigger individual check events
    if (websites.length > 0) {
      const events = websites.map((w) => ({
        name: "website/check.requested" as const,
        data: { websiteId: w.id },
      }));
      
      await step.sendEvent("fan-out-checks", events);
    }

    return { websitesQueued: websites.length };
  }
);

// Job 1b: Individual Website Check Worker
export const checkWebsite = inngest.createFunction(
  { id: "check-website", triggers: { event: "website/check.requested" }, concurrency: 10 },
  async ({ event, step }) => {
    const { websiteId } = event.data;

    // Fetch the URL
    const website = await step.run("fetch-website-url", async () => {
      const site = await prisma.website.findUnique({ where: { id: websiteId } });
      if (!site) throw new Error("Website not found");
      return site;
    });

    // 3. Ping the website and determine status
    const checkResult = await step.run("ping-website", async () => {
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
        })); // Fallback to HTTP if HTTPS fails
        
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

      return { status, timestamp: new Date() };
    });

    // 4 & 5. Save log and update website
    const statusChanged = await step.run("update-website-status", async () => {
      const current = await prisma.website.findUnique({ where: { id: websiteId } });
      const changed = current?.status !== checkResult.status && current?.status !== 'UNKNOWN';
      
      await prisma.website.update({
        where: { id: websiteId },
        data: {
          status: checkResult.status as "ERROR" | "OFFLINE" | "ONLINE" | "NOT_FOUND" | "BLOCKED" | "UNKNOWN",
          lastCheckedAt: checkResult.timestamp
        }
      });
      
      return { changed, oldStatus: current?.status, newStatus: checkResult.status };
    });

    // 6. Trigger notification if status changed and it's not online
    // If it recovered (went from OFFLINE -> ONLINE), we can notify too
    if (statusChanged.changed) {
      let notifyType = "";
      if (statusChanged.newStatus === "ONLINE") notifyType = "WEBSITE_RECOVERED";
      else if (statusChanged.newStatus === "BLOCKED") notifyType = "WEBSITE_BLOCKED";
      else notifyType = "WEBSITE_DOWN"; // covers NOT_FOUND, TIMEOUT, DNS_ERROR, OFFLINE

      await step.sendEvent("notify-status-change", {
        name: "notification/send",
        data: {
          websiteId,
          type: notifyType, 
        }
      });
    }

    return { websiteId, result: checkResult };
  }
);

// Job 2: Daily Package Expiry Check
export const checkPackageExpiryCron = inngest.createFunction(
  { id: "check-package-expiry", triggers: { cron: "0 0 * * *" } }, // Run daily at midnight
  async ({ step }) => {
    const expiringWebsites = await step.run("fetch-expiring-websites", async () => {
      const settings = await prisma.settings.findFirst();
      const thresholdDays = settings?.packageExpiringThresholdDays || 3;
      
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + thresholdDays);

      const websites = await prisma.website.findMany({
        where: {
          isActive: true,
          expiresAt: {
            lte: thresholdDate
          }
        }
      });

      const now = new Date();
      return websites.map(w => ({
        id: w.id,
        isExpired: w.expiresAt! <= now
      }));
    });

    if (expiringWebsites.length > 0) {
      const events = expiringWebsites.map((w) => ({
        name: "notification/send" as const,
        data: { 
          websiteId: w.id, 
          type: (w.isExpired ? "PACKAGE_EXPIRED" : "PACKAGE_EXPIRING") as any
        },
      }));

      await step.sendEvent("fan-out-expiry-notifications", events);
    }

    return { notificationsQueued: expiringWebsites.length };
  }
);

// Job 3: Notification Dispatcher
export const sendTelegramNotification = inngest.createFunction(
  { id: "send-telegram-notification", triggers: { event: "notification/send" }, retries: 3 },
  async ({ event, step }) => {
    const { websiteId, type } = event.data;

    // Fetch required data
    const data = await step.run("fetch-notification-data", async () => {
      const settings = await prisma.settings.findFirst();
      if (!settings) throw new Error("Settings not found");
      
      let website = null;
      let client = null;
      
      if (websiteId) {
        website = await prisma.website.findUnique({
          where: { id: websiteId },
          include: { package: true }
        });
        if (website) {
          client = await prisma.client.findUnique({ where: { id: website.clientId }});
        }
      }
      
      return { settings, website, client };
    });

    // Dispatch
    const dispatchResult = await step.run("dispatch-telegram", async () => {
      const { settings, website, client } = data;
      let deliveredTo = [];
      let messageContent = `System Notification: ${type}`;

      if (website && client) {
        if (type.startsWith("WEBSITE_")) {
          // e.g. WEBSITE_DOWN, WEBSITE_RECOVERED, etc
          let parsedType = "DOWN";
          if (type === "WEBSITE_RECOVERED") parsedType = "UP";
          else if (type === "WEBSITE_BLOCKED") parsedType = "BLOCKED";
          
          messageContent = formatWebsiteAlert(website.name, website.url, parsedType as any);
        } else if (type.startsWith("PACKAGE_")) {
          let parsedType = "EXPIRING";
          if (type === "PACKAGE_EXPIRED") parsedType = "EXPIRED";
          
          // website.expiresAt is serialized as a string from step.run
          const expiryString = website.expiresAt ? String(website.expiresAt).split('T')[0] : 'N/A';
          messageContent = formatPackageAlert(website.name, website.url, website.package.name, expiryString, parsedType as any);
        }

        const clientBotToken = client.telegramBotToken || settings.defaultTelegramBotToken;
        
        // Notify Client
        if (clientBotToken && client.telegramChatId) {
          await sendTelegramMessage({ 
            botToken: clientBotToken, 
            chatId: client.telegramChatId, 
            message: messageContent 
          });
          deliveredTo.push("client");
        }
      }

      // Notify Admin
      if (settings.adminTelegramBotToken && settings.adminTelegramChatId) {
        await sendTelegramMessage({ 
          botToken: settings.adminTelegramBotToken, 
          chatId: settings.adminTelegramChatId, 
          message: `[ADMIN COPY]\n\n${messageContent}` 
        });
        deliveredTo.push("admin");
      }

      return { success: true, deliveredTo, messageContent };
    });

    // Log it
    await step.run("log-notification", async () => {
      const { client, website } = data;
      
      await prisma.notificationLog.create({
        data: {
          type: type as any,
          recipientType: "CLIENT",
          recipientChatId: client?.telegramChatId || data.settings.adminTelegramChatId || "SYSTEM",
          websiteId: website?.id || null,
          clientId: client?.id || null,
          message: dispatchResult.messageContent,
          status: dispatchResult.deliveredTo.length > 0 ? "SENT" : "FAILED",
          sentAt: new Date()
        }
      });
    });

    return { message: "Notification handled", result: dispatchResult };
  }
);
