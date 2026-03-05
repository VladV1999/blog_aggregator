import {
    createFeedFollow,
    deleteFeedFollow,
    getFeedFollowsForUser
} from "../lib/db/queries/feed_follows";
import { selectFeedWithUrl } from "../lib/db/queries/feeds";
import { User } from "../lib/db/schema";
export async function handlerFollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        throw new Error("This function should only contain the URL for the feed!");
    }
    const url = args[0];
    const feeds = await selectFeedWithUrl(url);
    const feedRecord = await createFeedFollow(user.id, feeds.id);
    console.log(`The current user is ${user.name}, and the name of the feed \
        is ${feedRecord.feedName}`);
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]): Promise<void> {
    const feeds = await getFeedFollowsForUser(user.id);
    for (const feed of feeds) {
        console.log(`The user ${user.name} is currently following ${feed.feedName}`);
    }
}

export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        throw new Error("This function only accepts the URL, please, provide ONLY the URL!");
    }
    const url = args[0];
    const feed = await selectFeedWithUrl(url);
    const response = await deleteFeedFollow(feed.id, user.id);
    if (!response) {
        throw new Error(`Failed to unfollow feed: ${url}`);
    }
    console.log(`${feed.name} Unfollowed Successfully`);
}