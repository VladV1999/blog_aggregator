import { getPostsForUser } from "../lib/db/queries/posts";
import { User } from "../lib/db/schema";
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