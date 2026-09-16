export interface TelegramSendOptions {
  botToken: string;
  chatId: string;
  message: string;
}

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

interface AlertOptions {
  isAdmin?: boolean;
  clientName?: string;
}

export function formatWebsiteAlert(
  websiteName: string, 
  url: string, 
  status: "UP" | "DOWN" | "BLOCKED",
  options?: AlertOptions
) {
  const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const adminPrefix = options?.isAdmin ? `[ADMIN] ` : ``;
  const clientLine = (options?.isAdmin && options?.clientName) ? `👤 <b>Client:</b> ${options.clientName}\n` : ``;
  
  if (status === "UP") {
    return `✅ <b>${adminPrefix}SYSTEM RECOVERY NOTICE</b>\n\n` +
           `The automated monitoring system has detected that service has been restored for the following property:\n\n` +
           `${clientLine}` +
           `🏢 <b>Property:</b> ${websiteName}\n` +
           `🔗 <b>Endpoint:</b> <a href="https://${url}">${url}</a>\n` +
           `📊 <b>Current State:</b> <code>ONLINE & RESPONSIVE</code>\n\n` +
           `<i>Generated on ${timestamp} WIB by PHS Dashboard</i>`;
  }
  
  if (status === "BLOCKED") {
    return `🚫 <b>${adminPrefix}ACCESS DENIED ALERT</b>\n\n` +
           `The monitoring engine received a 403 Forbidden response. The server is online, but access is currently restricted or blocked.\n\n` +
           `${clientLine}` +
           `🏢 <b>Property:</b> ${websiteName}\n` +
           `🔗 <b>Endpoint:</b> <a href="https://${url}">${url}</a>\n` +
           `📊 <b>Current State:</b> <code>BLOCKED (HTTP 403)</code>\n\n` +
           `<i>Generated on ${timestamp} WIB by PHS Dashboard</i>`;
  }

  return `🚨 <b>${adminPrefix}CRITICAL OUTAGE DETECTED</b>\n\n` +
         `The automated monitoring system failed to reach the following property. Service appears to be disrupted or offline.\n\n` +
         `${clientLine}` +
         `🏢 <b>Property:</b> ${websiteName}\n` +
         `🔗 <b>Endpoint:</b> <a href="https://${url}">${url}</a>\n` +
         `📊 <b>Current State:</b> <code>OFFLINE / UNREACHABLE</code>\n\n` +
         `<i>Please investigate the server infrastructure immediately.</i>\n` +
         `<i>Generated on ${timestamp} WIB by PHS Dashboard</i>`;
}

export function formatPackageAlert(
  websiteName: string, 
  url: string, 
  packageName: string,
  expiresAt: string,
  type: "EXPIRING" | "EXPIRED",
  options?: AlertOptions
) {
  const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const adminPrefix = options?.isAdmin ? `[ADMIN] ` : ``;
  const clientLine = (options?.isAdmin && options?.clientName) ? `👤 <b>Client:</b> ${options.clientName}\n` : ``;
  
  if (type === "EXPIRED") {
    return `❌ <b>${adminPrefix}SERVICE SUSPENSION NOTICE</b>\n\n` +
           `The billing cycle for the following property has concluded. The associated service tier is now expired.\n\n` +
           `${clientLine}` +
           `🏢 <b>Property:</b> ${websiteName}\n` +
           `🔗 <b>Endpoint:</b> <a href="https://${url}">${url}</a>\n` +
           `📦 <b>Service Tier:</b> ${packageName}\n` +
           `📅 <b>Expiration Date:</b> <code>${expiresAt}</code>\n\n` +
           (options?.isAdmin 
              ? `<i>Please follow up with the client for renewal or execute server suspension protocols.</i>\n\n`
              : `<i>Immediate administrative action is required to restore active status. Please contact support to arrange a renewal.</i>\n\n`
           ) +
           `<i>Generated on ${timestamp} WIB by PHS Dashboard</i>`;
  }

  return `⚠️ <b>${adminPrefix}UPCOMING RENEWAL NOTICE</b>\n\n` +
         `This is an automated reminder that the service tier for the following property is approaching expiration.\n\n` +
         `${clientLine}` +
         `🏢 <b>Property:</b> ${websiteName}\n` +
         `🔗 <b>Endpoint:</b> <a href="https://${url}">${url}</a>\n` +
         `📦 <b>Service Tier:</b> ${packageName}\n` +
         `📅 <b>Expiration Date:</b> <code>${expiresAt}</code>\n\n` +
         (options?.isAdmin
            ? `<i>Client should be notified to arrange renewal payment.</i>\n\n`
            : `<i>To prevent any disruption to your services, please ensure renewal arrangements are made prior to the expiration date.</i>\n\n`
         ) +
         `<i>Generated on ${timestamp} WIB by PHS Dashboard</i>`;
}
