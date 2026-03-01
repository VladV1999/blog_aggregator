import { db } from "..";
import { feeds } from "../schema";

export async function addFeedToDb(name: string, url: string, id: string) {
    const [result] = await db.insert(feeds).values({ name: name, url: url, userId: id}).returning();
    return result;
}