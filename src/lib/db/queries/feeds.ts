import { eq, sql, } from "drizzle-orm";
import { db } from "..";
import { feeds } from "../schema";

export async function addFeedToDb(name: string, url: string, id: string) {
    const [result] = await db.insert(feeds).values({ name: name, url: url, userId: id}).returning();
    return result;
}

export async function selectAllFeeds() {
    const result = await db.select().from(feeds);
    return result;
}

export async function selectFeedWithUrl(url: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

export async function markFeedFetched(id: string) {
    const [result] = await db.update(feeds).set({ updatedAt: new Date(),
        lastFetchedAt: new Date()
    }).where(eq(feeds.id, id)).returning();
    return result;
}
export async function getNextFeedToFetch() {
  const [result] = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} asc nulls first`)
    .limit(1);
  return result;
}