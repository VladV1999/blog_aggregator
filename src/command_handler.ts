import { readConfig, setUser } from "./config";
import { createFeedFollow, deleteFeedFollow, getFeedFollowsForUser, } from "./lib/db/queries/feed_follows";
import { addFeedToDb, getNextFeedToFetch, markFeedFetched, selectAllFeeds, selectFeedWithUrl } from "./lib/db/queries/feeds";
import { createPost, getPostsForUser } from "./lib/db/queries/posts";
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
    console.log(`The user ${username} has successfully logged in!`);
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

export async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <time_between_reqs>`);
  }

  const timeArg = args[0];
  const timeBetweenRequests = parseDuration(timeArg);
  if (!timeBetweenRequests) {
    throw new Error(
      `invalid duration: ${timeArg} — use format 1h 30m 15s or 3500ms`,
    );
  }

  console.log(`Collecting feeds every ${timeArg}...`);

  scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

function handleError(err: unknown) {
  console.error(
    `Error scraping feeds: ${err instanceof Error ? err.message : err}`,
  );
}

export function parseDuration(durationStr: string) {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);
  if (!match) return;

  if (match.length !== 3) return;

  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "ms":
      return value;
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      return;
  }
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

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
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

export async function scrapeFeeds() {
    const feedToGo = await getNextFeedToFetch();
    if (!feedToGo) {
        throw new Error("There are currently no feeds in the database");
    }
    await markFeedFetched(feedToGo.id);
    const feed = await fetchFeed(feedToGo.url);
    for (const item of feed.channel.item) {
        const date = validateDate(new Date(item.pubDate))
        const newPost = {
            url: item.link,
            feedId: feedToGo.id,
            title: item.title,
            description: item.description,
            publishedAt: date ? new Date(item.pubDate) : new Date()
        }
        const post = await createPost(newPost);
        console.log(`Fetching post title: ${newPost.title}`);
    }
}

export async function handlerBrowse(cmdName: string, user: User, ...args: string[]) {
    if (args.length !== 1) {
        args[0] = "2";
    }
    if (!parseInt((args[0]))) {
        args[0] = "2";
    }
    const limit = parseInt(args[0]); 
    const result = await getPostsForUser(user.id, limit);
    for (const item of result) {
        console.log(`User with id of ${user.name}
            has looked up the blog: ${item.title}
            with the url of ${item.url}
            and here is a small summary for it !
            ${item.description}`);
    }
}

function validateDate(date: Date) {
    return !isNaN(date.getTime())
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