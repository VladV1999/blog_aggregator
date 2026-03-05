import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
});

export const feeds = pgTable("feeds", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
    .notNull().defaultNow()
    .$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
    url: text("url").notNull().unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade'}).notNull(),
    lastFetchedAt: timestamp("last_fetched_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const feedFollows = pgTable(
  "feed_follows",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    feedId: uuid("feed_id")
      .notNull()
      .references(() => feeds.id, { onDelete: "cascade" }),
  },
  (t) => ({ unq: unique().on(t.userId, t.feedId) }),
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
    title: text("title").notNull(),
    url: text("url").notNull(),
    description: text("description"),
    publishedAt: timestamp("published_at").defaultNow(),
    feedId: uuid("feed_id")
    .notNull()
    .references(() => feeds.id, { onDelete: "cascade" })
  },
  (t) => ({ unq: unique().on(t.url)}),
);

export type NewPost = typeof posts.$inferInsert;
export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;