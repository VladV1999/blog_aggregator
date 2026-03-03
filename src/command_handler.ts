import { readConfig, setUser } from "./config";
import { createFeedFollow, deleteFeedFollow, getFeedFollowsForUser, } from "./lib/db/queries/feed_follows";
import { addFeedToDb, selectAllFeeds, selectFeedWithUrl } from "./lib/db/queries/feeds";
import { createUser, deleteAllUsers, getUser, getUserById, getUsers } from "./lib/db/queries/users";
import { feeds, users } from "./lib/db/schema";
import { fetchFeed } from "./lib/rss";


export async function handlerLogin(cmdName:string, ...args: string[]): Promise<void> {
    if (args.length === 0) {
        throw new Error("The login handler must have a username!!!");
    }
    const username = args[0];
    if (await getUser(username) === undefined) {
        throw new Error(`The user ${username} is not registered in the database!`);
    }
    setUser(username);
    console.log(`The user ${username}`);
}

export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handler = registry[cmdName];
    if (!handler) throw new Error(`Unknown command: ${cmdName}`);
    await handler(cmdName, ...args);
}

export async function handlerReset(cmdName: string, ...args: string[]): Promise<void> {
    const res = await deleteAllUsers();
    if (res === undefined) {
        console.log("There were no users in the database, nothing to delete");
        return;
    }
    console.log("Successfully deleted all users");
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
    }

    const userName = args[0];
    const user = await createUser(userName);
    if (!user) {
    throw new Error(`User ${userName} not found`);
    }

    setUser(user.name);
    console.log("User created successfully!");
}

export async function handlerUsers(cmdName: string, ...args: string[]): Promise<void> {
    const names = await getUsers();
    const config = readConfig();
    const currentlyLoggedIn = config.currentUserName;
    for (const name of names) {
        if (name.name === currentlyLoggedIn) {
            console.log(`${name.name} (current)`);
            continue;
        }
        console.log(`${name.name}`);
    }
}

export async function handlerAgg(cmdName: string, ...args: string[]): Promise<void> {
    console.log(JSON.stringify(await fetchFeed("https://www.wagslane.dev/index.xml")));
}

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

export async function handlerFollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        throw new Error("This function should only contain the URL for the feed!");
    }
    const url = args[0];
    const feedz = await selectFeedWithUrl(url);
    const feedRecord = await createFeedFollow(user.id, feedz.id);
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

export  function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName: string, ...args: string[]) => {
        const config = readConfig();
        const currentUser = config.currentUserName;
        if (!currentUser) {
            throw new Error("there is no current user at this time");
        }
        const user = await getUser(currentUser);
        await handler(cmdName, user, ...args);
    };
}
export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;
export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;
export type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;
export type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler