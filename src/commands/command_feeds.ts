import { createFeedFollow, } from "../lib/db/queries/feed_follows";
import { addFeedToDb, selectAllFeeds } from "../lib/db/queries/feeds";
import { getUserById } from "../lib/db/queries/users";
import { Feed, User } from "../lib/db/schema";
export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length !== 2) {
        throw new Error("This function only accepts the name of the feed, and its url, \n\
            Please provide only the name and url");
    }
    const nameOfFeed = args[0];
    const url = args[1];
    const userID = user.id;
    const feed = await addFeedToDb(nameOfFeed, url, userID);
    const result = await createFeedFollow(userID, feed.id);
    printFeed(user, feed);
}

export function printFeed(user: User, feed: Feed) {
    console.log(`${user.name} has created the feed called ${feed.name}
        which can be found at ${feed.url}, at the time of ${feed.createdAt}
        and the ID of the user is ${feed.userId}`);
}

export async function handlerListFeeds(cmdName: string, ...args: string[]): Promise<void> {
    const feeds = await selectAllFeeds();
    for (const feed of feeds) {
        const user = await getUserById(feed.userId);
        console.log(`The ${feed.name}, which can be found at \
            ${feed.url} \
            has been created by ${user.name}`);
    }
}
