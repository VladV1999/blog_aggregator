import { XMLParser } from "fast-xml-parser";

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    const response = await fetch(feedURL, {
        headers: {
            "User-Agent": "gator"
        }
    });
    if (!response.ok) {
        throw new Error("Something went wrong while fetching the data...");
    }
    const responseText = await response.text();
    let parser = new XMLParser();
    const obj = parser.parse(responseText);
    if (!Object.hasOwn(obj.rss, "channel")) {
        throw new Error("There is no channel field provided, faulty XML! for this case at least...");
    }
    if (!(Object.hasOwn(obj.rss.channel, "title") && 
    Object.hasOwn(obj.rss.channel, "link") && 
    Object.hasOwn(obj.rss.channel, "description"))) {
        throw new Error("Missing field! missing either link, title, or description of channel!");
    }
    const channelTitle = obj.rss.channel.title;
    const channelLink = obj.rss.channel.link;
    const channelDescription = obj.rss.channel.description;
    let items: any[] = [];
    if (Object.hasOwn(obj.rss.channel, "item")) {
        if (!Array.isArray(obj.rss.channel.item)) {
            items = [obj.rss.channel.item]
        } else {
            items = [...obj.rss.channel.item];
        }
    }
    const validatedItems: RSSItem[] = [];
    for (const item of items) {
        if (Object.hasOwn(item, "title") &&
        Object.hasOwn(item, "link") &&
        Object.hasOwn(item, "description") &&
        Object.hasOwn(item, "pubDate")) {
            const newObj: RSSItem = {
                title: item.title,
                link: item.link,
                description: item.description,
                pubDate: item.pubDate,
            }
        validatedItems.push(newObj);
        }
    }
    return {
        channel: {
            title: channelTitle,
            link: channelLink,
            description: channelDescription,
            item: validatedItems
        }
    }
}

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};