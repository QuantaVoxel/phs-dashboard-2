import { inngest } from "./client";
import { sendTelegramMessage, formatWebsiteAlert, formatPackageAlert } from "@/lib/telegram";
import { prisma } from "@/lib/prisma";
import { pingWebsiteCore } from "@/lib/ping";

// Job 1a: Cron to trigger checks for all websites
export const checkAllWebsitesCron = inngest.createFunction(
  { id: "check-all-websites", triggers: { cron: "*/30 * * * *" } }, // Runs every 30 mins
  async ({ step }) => {
    const websites = await step.run("fetch-websites", async () => {
      return await prisma.website.findMany({ 
        where: { isActive: true },
        select: { id: true }
      });
    });

    if (websites.length > 0) {
      const events = websites.map((w) => ({
        name: "website/check.requested" as const,
        data: { websiteId: w.id },
      }));
      await step.sendEvent("trigger-individual-checks", events);
    }
    
    return { queued: websites.length };
  }
);

// Job 1b: Check individual website
export const checkWebsite = inngest.createFunction(
  { id: "check-website", triggers: { event: "website/check.requested" }, concurrency: 50 },
  async ({ event, step }) => {
    const { websiteId } = event.data;

    const result = await step.run("execute-ping", async () => {
      return await pingWebsiteCore(websiteId);
    });

    if (result.changed) {
      let notifyType = "";
      if (result.newStatus === "ONLINE") notifyType = "WEBSITE_RECOVERED";
      else if (result.newStatus === "BLOCKED") notifyType = "WEBSITE_BLOCKED";
      else notifyType = "WEBSITE_DOWN"; 

      await step.sendEvent("notify-status-change", {
        name: "notification/send",
        data: {
          websiteId,
          type: notifyType, 
        }
      });
    }

    await step.run("revalidate-cache", async () => {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/", "layout");
      return true;
    });

    return { websiteId, result };
  }
);

// Job 2: Daily Package Expiry Check
export const checkPackageExpiryCron = inngest.createFunction(
  { id: "check-package-expiry", triggers: { cron: "0 0 * * *" } }, // Run daily at midnight
  async ({ step }) => {
    const expiringWebsites = await step.run("fetch-expiring", async () => {
      const settings = await prisma.settings.findFirst();
      const thresholdDays = settings?.packageExpiringThresholdDays || 3;
      
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + thresholdDays);

      return await prisma.website.findMany({
        where: {
          isActive: true,
          expiresAt: {
            lte: thresholdDate,
            gte: new Date() // Not already expired (handle separately if needed)
          }
        },
        select: { id: true }
      });
    });

    if (expiringWebsites.length > 0) {
      const events = expiringWebsites.map((w) => ({
        name: "notification/send" as const,
        data: { websiteId: w.id, type: "PACKAGE_EXPIRING" },
      }));
      await step.sendEvent("trigger-expiring-notifs", events);
    }

    const expiredWebsites = await step.run("fetch-expired", async () => {
      return await prisma.website.findMany({
        where: {
          isActive: true,
          expiresAt: { lt: new Date() }
        },
        select: { id: true }
      });
    });

    if (expiredWebsites.length > 0) {
      const events = expiredWebsites.map((w) => ({
        name: "notification/send" as const,
        data: { websiteId: w.id, type: "PACKAGE_EXPIRED" },
      }));
      await step.sendEvent("trigger-expired-notifs", events);
    }

    return { 
      expiringNotified: expiringWebsites.length, 
      expiredNotified: expiredWebsites.length 
    };
  }
);

// Job 3: Notification Dispatcher
export const dispatchNotification = inngest.createFunction(
  { id: "dispatch-notification", triggers: { event: "notification/send" }, concurrency: 10 },
  async ({ event, step }) => {
    const { websiteId, type, message } = event.data;

    // 1. Save to DB first
    const log = await step.run("save-log-to-db", async () => {
      return await prisma.notificationLog.create({
        data: {
          type,
          recipientType: "ADMIN",
          recipientChatId: "UNKNOWN",
          websiteId,
          message: message || "Automated Alert",
          status: "PENDING"
        }
      });
    });

    // 2. Fetch required context
    const data = await step.run("fetch-context", async () => {
      const settings = await prisma.settings.findFirst();
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
      let clientMessageContent = `System Notification: ${type}`;
      let adminMessageContent = `System Notification: ${type}`;

      if (website && client) {
        if (type.startsWith("WEBSITE_")) {
          let parsedType = "DOWN";
          if (type === "WEBSITE_RECOVERED") parsedType = "UP";
          else if (type === "WEBSITE_BLOCKED") parsedType = "BLOCKED";
          
          clientMessageContent = formatWebsiteAlert(website.name, website.url, parsedType as any);
          adminMessageContent = formatWebsiteAlert(website.name, website.url, parsedType as any, { isAdmin: true, clientName: client.name });
        } else if (type.startsWith("PACKAGE_")) {
          let parsedType = "EXPIRING";
          if (type === "PACKAGE_EXPIRED") parsedType = "EXPIRED";
          
          const expiryString = website.expiresAt ? String(website.expiresAt).split('T')[0] : 'N/A';
          clientMessageContent = formatPackageAlert(website.name, website.url, website.package.name, expiryString, parsedType as any);
          adminMessageContent = formatPackageAlert(website.name, website.url, website.package.name, expiryString, parsedType as any, { isAdmin: true, clientName: client.name });
        }

        const clientBotToken = client.telegramBotToken || (settings ? settings.defaultTelegramBotToken : null);
        
        // Notify Client
        if (clientBotToken && client.telegramChatId) {
          await sendTelegramMessage({ 
            botToken: clientBotToken, 
            chatId: client.telegramChatId, 
            message: clientMessageContent 
          });
          deliveredTo.push("client");
        }
      }

      // Notify Admin
      if (settings && settings.adminTelegramBotToken && settings.adminTelegramChatId) {
        await sendTelegramMessage({ 
          botToken: settings.adminTelegramBotToken, 
          chatId: settings.adminTelegramChatId, 
          message: adminMessageContent 
        });
        deliveredTo.push("admin");
      }

      return { success: true, deliveredTo, messageContent: adminMessageContent };
    });

    // Log it
    await step.run("mark-log-sent", async () => {
      await prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          message: dispatchResult.messageContent
        }
      });
      
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/", "layout");
    });

    return dispatchResult;
  }
);
