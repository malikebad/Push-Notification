import {
  users,
  subscribers,
  campaigns,
  notifications,
  templates,
  rssFeeds,
  type User,
  type UpsertUser,
  type Subscriber,
  type InsertSubscriber,
  type Campaign,
  type InsertCampaign,
  type Notification,
  type InsertNotification,
  type Template,
  type InsertTemplate,
  type RssFeed,
  type InsertRssFeed,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (Replit Auth - mandatory)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Subscriber operations
  getSubscribers(filters?: { search?: string; browser?: string }): Promise<Subscriber[]>;
  getSubscriber(id: string): Promise<Subscriber | undefined>;
  getSubscriberByEndpoint(endpoint: string): Promise<Subscriber | undefined>;
  createSubscriber(data: InsertSubscriber): Promise<Subscriber>;
  updateSubscriber(id: string, data: Partial<Subscriber>): Promise<Subscriber>;
  deleteSubscriber(id: string): Promise<void>;

  // Campaign operations
  getCampaigns(filters?: { limit?: number }): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(data: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign>;
  deleteCampaign(id: string): Promise<void>;

  // Notification operations
  createNotification(data: InsertNotification): Promise<Notification>;
  updateNotification(id: string, data: Partial<Notification>): Promise<Notification>;
  getCampaignNotifications(campaignId: string): Promise<Notification[]>;

  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(data: InsertTemplate): Promise<Template>;
  deleteTemplate(id: string): Promise<void>;

  // RSS Feed operations
  getRssFeeds(): Promise<RssFeed[]>;
  getRssFeed(id: string): Promise<RssFeed | undefined>;
  createRssFeed(data: InsertRssFeed): Promise<RssFeed>;
  updateRssFeed(id: string, data: Partial<RssFeed>): Promise<RssFeed>;
  deleteRssFeed(id: string): Promise<void>;

  // Analytics operations
  getOverviewStats(): Promise<any>;
  getGrowthData(): Promise<any[]>;
  getBrowserStats(): Promise<any[]>;
  getDeviceStats(): Promise<any[]>;
  getTopCampaigns(): Promise<Campaign[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (Replit Auth - mandatory)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Subscriber operations
  async getSubscribers(filters?: { search?: string; browser?: string }): Promise<Subscriber[]> {
    let query = db.select().from(subscribers);

    const conditions = [];
    if (filters?.browser && filters.browser !== "all") {
      conditions.push(eq(subscribers.browser, filters.browser));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(subscribers.createdAt));
    return results;
  }

  async getSubscriber(id: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.id, id));
    return subscriber;
  }

  async getSubscriberByEndpoint(endpoint: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.endpoint, endpoint));
    return subscriber;
  }

  async createSubscriber(data: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await db.insert(subscribers).values(data).returning();
    return subscriber;
  }

  async updateSubscriber(id: string, data: Partial<Subscriber>): Promise<Subscriber> {
    const [subscriber] = await db
      .update(subscribers)
      .set({ ...data, lastActive: new Date() })
      .where(eq(subscribers.id, id))
      .returning();
    return subscriber;
  }

  async deleteSubscriber(id: string): Promise<void> {
    await db.delete(subscribers).where(eq(subscribers.id, id));
  }

  // Campaign operations
  async getCampaigns(filters?: { limit?: number }): Promise<Campaign[]> {
    let query = db.select().from(campaigns).orderBy(desc(campaigns.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return await query;
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async createCampaign(data: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(data).returning();
    return campaign;
  }

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set(data)
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  async deleteCampaign(id: string): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  // Notification operations
  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  async updateNotification(id: string, data: Partial<Notification>): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set(data)
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async getCampaignNotifications(campaignId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.campaignId, campaignId));
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates).orderBy(desc(templates.createdAt));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async createTemplate(data: InsertTemplate): Promise<Template> {
    const [template] = await db.insert(templates).values(data).returning();
    return template;
  }

  async deleteTemplate(id: string): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }

  // RSS Feed operations
  async getRssFeeds(): Promise<RssFeed[]> {
    return await db.select().from(rssFeeds).orderBy(desc(rssFeeds.createdAt));
  }

  async getRssFeed(id: string): Promise<RssFeed | undefined> {
    const [feed] = await db.select().from(rssFeeds).where(eq(rssFeeds.id, id));
    return feed;
  }

  async createRssFeed(data: InsertRssFeed): Promise<RssFeed> {
    const [feed] = await db.insert(rssFeeds).values(data).returning();
    return feed;
  }

  async updateRssFeed(id: string, data: Partial<RssFeed>): Promise<RssFeed> {
    const [feed] = await db
      .update(rssFeeds)
      .set(data)
      .where(eq(rssFeeds.id, id))
      .returning();
    return feed;
  }

  async deleteRssFeed(id: string): Promise<void> {
    await db.delete(rssFeeds).where(eq(rssFeeds.id, id));
  }

  // Analytics operations
  async getOverviewStats(): Promise<any> {
    const [subscriberCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(subscribers)
      .where(eq(subscribers.status, "active"));

    const [notificationStats] = await db
      .select({
        totalDelivered: sql<number>`count(*)::int`,
        totalClicked: sql<number>`sum(case when ${notifications.clicked} then 1 else 0 end)::int`,
      })
      .from(notifications)
      .where(sql`${notifications.sentAt} >= now() - interval '30 days'`);

    const totalSent = notificationStats?.totalDelivered || 0;
    const totalClicked = notificationStats?.totalClicked || 0;

    return {
      totalSubscribers: subscriberCount?.count || 0,
      newSubscribers: 0, // Could calculate this from last week
      totalDelivered: totalSent,
      totalClicked,
      clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
    };
  }

  async getGrowthData(): Promise<any[]> {
    const result = await db
      .select({
        date: sql<string>`date(${subscribers.createdAt})`,
        subscribers: sql<number>`count(*)::int`,
      })
      .from(subscribers)
      .where(sql`${subscribers.createdAt} >= now() - interval '30 days'`)
      .groupBy(sql`date(${subscribers.createdAt})`)
      .orderBy(sql`date(${subscribers.createdAt})`);

    return result.map(row => ({
      date: row.date,
      subscribers: row.subscribers,
    }));
  }

  async getBrowserStats(): Promise<any[]> {
    const result = await db
      .select({
        name: subscribers.browser,
        value: sql<number>`count(*)::int`,
      })
      .from(subscribers)
      .where(eq(subscribers.status, "active"))
      .groupBy(subscribers.browser);

    return result.filter(r => r.name).map(row => ({
      name: row.name || "Unknown",
      value: row.value,
    }));
  }

  async getDeviceStats(): Promise<any[]> {
    const result = await db
      .select({
        name: subscribers.device,
        value: sql<number>`count(*)::int`,
      })
      .from(subscribers)
      .where(eq(subscribers.status, "active"))
      .groupBy(subscribers.device);

    return result.filter(r => r.name).map(row => ({
      name: row.name || "Unknown",
      value: row.value,
    }));
  }

  async getTopCampaigns(): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.status, "sent"))
      .orderBy(desc(sql`${campaigns.totalClicked}::float / NULLIF(${campaigns.totalSent}, 0)`))
      .limit(10);
  }
}

export const storage = new DatabaseStorage();
