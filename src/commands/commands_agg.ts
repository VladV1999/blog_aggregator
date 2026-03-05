import {
    getNextFeedToFetch,
    markFeedFetched,
} from "../lib/db/queries/feeds";
import { createPost } from "../lib/db/queries/posts";
import { fetchFeed } from "./rss";
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

function validateDate(date: Date) {
    return !isNaN(date.getTime())
}
