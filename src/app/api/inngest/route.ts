import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { checkAllWebsitesCron, checkWebsite, checkPackageExpiryCron, dispatchNotification } from "../../../inngest/functions";

export const maxDuration = 300; // 5 minutes max runtime for Vercel/serverless environments

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [checkAllWebsitesCron, checkWebsite, checkPackageExpiryCron, dispatchNotification],
});
