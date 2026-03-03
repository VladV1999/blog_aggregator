import { and, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, users } from "../schema";

export async function createFeedFollow(userId: string, feedId: string) {
    const [newFeedFollow] = await db
    .insert(feedFollows)
    .values({ feedId, userId })
    .returning();
    const [result] = await db
    .select({
        id: feedFollows.id,
        createdAt: feedFollows.createdAt,
        updatedAT: feedFollows.updatedAt,
        userId: feedFollows.userId,
        feedId: feedFollows.feedId,
        feedName: feeds.name,
        userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(
        and(
        eq(feedFollows.id, newFeedFollow.id),
        eq(users.id, newFeedFollow.userId),
        ),
    );

    return result;
}

export async function getFeedFollowsForUser(userId: string) {
    const data = await db.select({ feedFollowsId: feedFollows.id,
        feedFollowsCreatedAt: feedFollows.createdAt,
        feedFollowsUpdatedAt: feedFollows.updatedAt,
        feedFollowsUserId: feedFollows.userId,
        feedFollowsFeedId: feedFollows.feedId,
        username: users.name,
        feedName: feeds.name,
     }).from(feedFollows).innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id)).where(eq(feedFollows.userId, userId));
    return data;
}

export async function deleteFeedFollow(feedId: string, userId: string) {
    const [result] = await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.feedId, feedId), eq(feedFollows.userId, userId)))
    .returning();

    return result;
}