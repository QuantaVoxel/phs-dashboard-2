import { Inngest } from "inngest";

// Define the event payloads
type Events = {
  "website/check.requested": {
    data: {
      websiteId: string;
    };
  };
  "notification/send": {
    data: {
      websiteId?: string;
      type: "WEBSITE_DOWN" | "WEBSITE_BLOCKED" | "WEBSITE_RECOVERED" | "PACKAGE_EXPIRING" | "PACKAGE_EXPIRED";
    };
  };
};

// Create a client to send and receive events
export const inngest = new Inngest({ id: "phs-dashboard", schemas: { events: {} as Events } });
