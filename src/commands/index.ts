import { handlerBrowse } from "./command_browse";
import {
    handlerFollow,
    handlerFollowing,
    handlerUnfollow
} from "./command_feed_follows";
import { handlerAddFeed, handlerListFeeds } from "./command_feeds";
import {
    CommandsRegistry,
    middlewareLoggedIn,
    registerCommand, runCommand
} from "./command_handler";
import { handlerReset } from "./command_reset";
import {
    handlerListUsers,
    handlerLogin,
    handlerRegister
} from "./command_users";
import { handlerAgg } from "./commands_agg";
async function main() {
    let registry: CommandsRegistry = {
        
    };
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handlerListUsers);
    registerCommand(registry, "agg", handlerAgg);
    registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
    registerCommand(registry, "feeds", handlerListFeeds);
    registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
    registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
    registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));
    registerCommand(registry, "browse", middlewareLoggedIn(handlerBrowse));
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("You must provide a valid command!");
        process.exit(1);
    }
    const commandName = args[0];
    const restOfArguments = args.slice(1);
    try {
        await runCommand(registry, commandName, ...restOfArguments);
    } catch (error) {
        console.error((error as Error).message);
        process.exit(1);
    }
    process.exit(0);
}

await main();