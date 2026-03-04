import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, NewPost, posts } from "../schema";

export async function createPost (newPost: NewPost) {
    const [post] = await db.insert(posts).values(newPost)
    .onConflictDoUpdate({
        target: posts.url,
        set: {
            title: newPost.title,
            description: newPost.description,
            publishedAt: newPost.publishedAt
        }
    })
    .returning();
    return post;
}

export async function getPostsForUser(userId: string, limit: number) {
    const result = await db.select({
        id: posts.id,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        title: posts.title,
        url: posts.url,
        description: posts.description,
        publishedAt: posts.publishedAt,
        feedId: posts.feedId,
        feedName: feeds.name,
    }).from(posts)
    .innerJoin(feedFollows, eq(feedFollows.feedId, posts.feedId))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId))
    .orderBy(sql`${posts.publishedAt} DESC NULLS LAST`)
    .limit(limit);
    return result;
}