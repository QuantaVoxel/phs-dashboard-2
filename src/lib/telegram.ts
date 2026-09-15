export interface TelegramSendOptions {
  botToken: string;
  chatId: string;
  message: string;
}

/**
 * Sends a message to a Telegram chat using the specified Bot Token.
 * Uses HTML parse mode to avoid strict MarkdownV2 escaping issues while supporting bold, italic, and code blocks.
 */
export async function sendTelegramMessage({ botToken, chatId, message }: TelegramSendOptions) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("[Telegram Error]", error);
    throw new Error(`Telegram API Error: ${error.description}`);
  }

  return response.json();
}

/**
 * Message Templates
 */

export function formatWebsiteAlert(
  websiteName: string, 
  url: string, 
  status: "WEBSITE_DOWN" | "WEBSITE_BLOCKED" | "WEBSITE_RECOVERED"
) {
  const emoji = status === "WEBSITE_RECOVERED" ? "✅" : (status === "WEBSITE_BLOCKED" ? "🚫" : "🚨");
  const title = status === "WEBSITE_RECOVERED" ? "PROPERTY RECOVERED" : "PROPERTY ALERT";
  const state = status === "WEBSITE_RECOVERED" ? "Online" : (status === "WEBSITE_BLOCKED" ? "Blocked / Access Denied" : "Offline / Unreachable");

  return `${emoji} <b>${title}</b>\n\n` +
         `<b>Name:</b> ${websiteName}\n` +
         `<b>URL:</b> <a href="https://${url}">${url}</a>\n` +
         `<b>State:</b> <code>${state}</code>\n\n` +
         `<i>Timestamp: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</i>`;
}

export function formatPackageAlert(
  websiteName: string, 
  url: string, 
  packageName: string,
  expiresAt: string,
  type: "PACKAGE_EXPIRING" | "PACKAGE_EXPIRED"
) {
  const emoji = type === "PACKAGE_EXPIRED" ? "❌" : "⚠️";
  const title = type === "PACKAGE_EXPIRED" ? "SERVICE EXPIRED" : "SERVICE EXPIRING SOON";

  return `${emoji} <b>${title}</b>\n\n` +
         `<b>Property:</b> ${websiteName}\n` +
         `<b>URL:</b> <a href="https://${url}">${url}</a>\n` +
         `<b>Active Tier:</b> ${packageName}\n` +
         `<b>Expiration:</b> <code>${expiresAt}</code>\n\n` +
         `<i>Please contact your administrator to renew your service.</i>`;
}
