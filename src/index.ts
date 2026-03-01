import { CommandsRegistry, handlerAddFeed, handlerAgg, handlerLogin, handlerRegister, handlerReset, handlerUsers, registerCommand, runCommand } from "./command_handler";
async function main() {
    let registry: CommandsRegistry = {
        
    };
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handlerUsers);
    registerCommand(registry, "agg", handlerAgg);
    registerCommand(registry, "addfeed", handlerAddFeed);
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