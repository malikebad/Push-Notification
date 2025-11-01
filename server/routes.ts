import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import webPush from "web-push";
import Parser from "rss-parser";
import cron from "node-cron";

// Initialize Web Push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = "mailto:info@inventerdesignstudio.com";

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

const rssParser = new Parser();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // VAPID public key endpoint
  app.get("/api/vapid-public-key", (req, res) => {
    res.json({ publicKey: vapidPublicKey });
  });

  // Subscriber routes
  app.get("/api/subscribers", isAuthenticated, async (req, res) => {
    try {
      const { search, browser } = req.query;
      const subscribers = await storage.getSubscribers({
        search: search as string,
        browser: browser as string,
      });
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  app.post("/api/subscribers", async (req, res) => {
    try {
      const { endpoint, p256dh, auth, browser, device } = req.body;

      // Check if subscriber already exists
      const existing = await storage.getSubscriberByEndpoint(endpoint);
      if (existing) {
        return res.json(existing);
      }

      const subscriber = await storage.createSubscriber({
        endpoint,
        p256dh,
        auth,
        browser,
        device,
        status: "active",
        segments: [],
      });

      res.json(subscriber);
    } catch (error) {
      console.error("Error creating subscriber:", error);
      res.status(500).json({ message: "Failed to create subscriber" });
    }
  });

  app.delete("/api/subscribers/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSubscriber(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      res.status(500).json({ message: "Failed to delete subscriber" });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", isAuthenticated, async (req, res) => {
    try {
      const { limit } = req.query;
      const campaigns = await storage.getCampaigns({
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/:id", isAuthenticated, async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.post("/api/campaigns", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaign = await storage.createCampaign({
        ...req.body,
        createdBy: userId,
      });
      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  app.post("/api/campaigns/:id/send", isAuthenticated, async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Get active subscribers
      const subscribers = await storage.getSubscribers({});
      const activeSubscribers = subscribers.filter(s => s.status === "active");

      const payload = JSON.stringify({
        title: campaign.title,
        body: campaign.body,
        icon: campaign.icon,
        url: campaign.url,
        badge: campaign.badge,
        campaignId: campaign.id,
      });

      let sent = 0;
      let failed = 0;
      let clicked = 0;

      // Send notifications to all subscribers
      for (const subscriber of activeSubscribers) {
        try {
          await webPush.sendNotification(
            {
              endpoint: subscriber.endpoint,
              keys: {
                p256dh: subscriber.p256dh,
                auth: subscriber.auth,
              },
            },
            payload
          );

          await storage.createNotification({
            campaignId: campaign.id,
            subscriberId: subscriber.id,
            status: "sent",
            clicked: false,
          });

          sent++;
        } catch (error) {
          console.error("Error sending to subscriber:", error);
          failed++;

          await storage.createNotification({
            campaignId: campaign.id,
            subscriberId: subscriber.id,
            status: "failed",
            clicked: false,
          });
        }
      }

      // Update campaign stats
      await storage.updateCampaign(campaign.id, {
        status: "sent",
        sentAt: new Date(),
        totalSent: sent,
        totalFailed: failed,
        totalClicked: clicked,
      });

      res.json({
        success: true,
        sent,
        failed,
      });
    } catch (error) {
      console.error("Error sending campaign:", error);
      res.status(500).json({ message: "Failed to send campaign" });
    }
  });

  app.post("/api/campaigns/:id/click", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Increment click count
      await storage.updateCampaign(campaign.id, {
        totalClicked: (campaign.totalClicked || 0) + 1,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking click:", error);
      res.status(500).json({ message: "Failed to track click" });
    }
  });

  // Template routes
  app.get("/api/templates", isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const template = await storage.createTemplate({
        ...req.body,
        createdBy: userId,
      });
      res.json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.delete("/api/templates/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTemplate(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // RSS Feed routes
  app.get("/api/rss-feeds", isAuthenticated, async (req, res) => {
    try {
      const feeds = await storage.getRssFeeds();
      res.json(feeds);
    } catch (error) {
      console.error("Error fetching RSS feeds:", error);
      res.status(500).json({ message: "Failed to fetch RSS feeds" });
    }
  });

  app.post("/api/rss-feeds", isAuthenticated, async (req, res) => {
    try {
      const feed = await storage.createRssFeed(req.body);
      res.json(feed);
    } catch (error) {
      console.error("Error creating RSS feed:", error);
      res.status(500).json({ message: "Failed to create RSS feed" });
    }
  });

  app.patch("/api/rss-feeds/:id", isAuthenticated, async (req, res) => {
    try {
      const feed = await storage.updateRssFeed(req.params.id, req.body);
      res.json(feed);
    } catch (error) {
      console.error("Error updating RSS feed:", error);
      res.status(500).json({ message: "Failed to update RSS feed" });
    }
  });

  app.delete("/api/rss-feeds/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteRssFeed(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting RSS feed:", error);
      res.status(500).json({ message: "Failed to delete RSS feed" });
    }
  });

  // Analytics routes
  app.get("/api/stats/overview", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getOverviewStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching overview stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/stats/growth", isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getGrowthData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching growth data:", error);
      res.status(500).json({ message: "Failed to fetch growth data" });
    }
  });

  app.get("/api/stats/browsers", isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getBrowserStats();
      res.json(data);
    } catch (error) {
      console.error("Error fetching browser stats:", error);
      res.status(500).json({ message: "Failed to fetch browser stats" });
    }
  });

  app.get("/api/stats/devices", isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getDeviceStats();
      res.json(data);
    } catch (error) {
      console.error("Error fetching device stats:", error);
      res.status(500).json({ message: "Failed to fetch device stats" });
    }
  });

  app.get("/api/stats/delivery-trends", isAuthenticated, async (req, res) => {
    try {
      // Mock data for now - could calculate from notifications table
      const data = [];
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split("T")[0],
          delivered: Math.floor(Math.random() * 100),
          clicked: Math.floor(Math.random() * 30),
        });
      }
      res.json(data);
    } catch (error) {
      console.error("Error fetching delivery trends:", error);
      res.status(500).json({ message: "Failed to fetch delivery trends" });
    }
  });

  app.get("/api/stats/engagement", isAuthenticated, async (req, res) => {
    try {
      // Mock data for now
      const data = [];
      for (let i = 7; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split("T")[0],
          ctr: Math.floor(Math.random() * 40) + 10,
        });
      }
      res.json(data);
    } catch (error) {
      console.error("Error fetching engagement data:", error);
      res.status(500).json({ message: "Failed to fetch engagement data" });
    }
  });

  app.get("/api/stats/top-campaigns", isAuthenticated, async (req, res) => {
    try {
      const campaigns = await storage.getTopCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching top campaigns:", error);
      res.status(500).json({ message: "Failed to fetch top campaigns" });
    }
  });

  // Schedule RSS feed checking (every hour)
  cron.schedule("0 * * * *", async () => {
    console.log("Checking RSS feeds...");
    try {
      const feeds = await storage.getRssFeeds();
      const enabledFeeds = feeds.filter(f => f.enabled);

      for (const feed of enabledFeeds) {
        try {
          const parsed = await rssParser.parseURL(feed.url);

          // Update last fetched
          await storage.updateRssFeed(feed.id, {
            lastFetched: new Date(),
          });

          console.log(`Checked feed: ${feed.name}`);
        } catch (error) {
          console.error(`Error parsing feed ${feed.name}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in RSS feed check:", error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
