import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (Replit Auth - mandatory)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (Replit Auth - mandatory)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("member"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Subscribers table - stores web push subscription data
export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  browser: varchar("browser"),
  device: varchar("device"),
  status: varchar("status").default("active"),
  segments: text("segments").array(),
  createdAt: timestamp("created_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

// Campaigns table - notification campaigns
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  body: text("body").notNull(),
  icon: text("icon"),
  url: text("url"),
  badge: text("badge"),
  image: text("image"),
  scheduledAt: timestamp("scheduled_at"),
  status: varchar("status").default("draft"),
  targetSegments: text("target_segments").array(),
  targetBrowsers: text("target_browsers").array(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  sentAt: timestamp("sent_at"),
  totalSent: integer("total_sent").default(0),
  totalClicked: integer("total_clicked").default(0),
  totalFailed: integer("total_failed").default(0),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  totalSent: true,
  totalClicked: true,
  totalFailed: true,
});

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

// Notifications table - log of sent notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id),
  subscriberId: varchar("subscriber_id").references(() => subscribers.id),
  status: varchar("status").default("sent"),
  clicked: boolean("clicked").default(false),
  sentAt: timestamp("sent_at").defaultNow(),
  clickedAt: timestamp("clicked_at"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  sentAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Templates table - reusable notification templates
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  icon: text("icon"),
  url: text("url"),
  badge: text("badge"),
  image: text("image"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// RSS Feeds table - RSS feed sources for auto-notifications
export const rssFeeds = pgTable("rss_feeds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  enabled: boolean("enabled").default(true),
  lastFetched: timestamp("last_fetched"),
  lastItemDate: timestamp("last_item_date"),
  templateId: varchar("template_id").references(() => templates.id),
  autoSend: boolean("auto_send").default(false),
  targetSegments: text("target_segments").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRssFeedSchema = createInsertSchema(rssFeeds).omit({
  id: true,
  createdAt: true,
  lastFetched: true,
});

export type InsertRssFeed = z.infer<typeof insertRssFeedSchema>;
export type RssFeed = typeof rssFeeds.$inferSelect;

// Relations
export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  creator: one(users, {
    fields: [campaigns.createdBy],
    references: [users.id],
  }),
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [notifications.campaignId],
    references: [campaigns.id],
  }),
  subscriber: one(subscribers, {
    fields: [notifications.subscriberId],
    references: [subscribers.id],
  }),
}));

export const templatesRelations = relations(templates, ({ one }) => ({
  creator: one(users, {
    fields: [templates.createdBy],
    references: [users.id],
  }),
}));

export const rssFeedsRelations = relations(rssFeeds, ({ one }) => ({
  template: one(templates, {
    fields: [rssFeeds.templateId],
    references: [templates.id],
  }),
}));
