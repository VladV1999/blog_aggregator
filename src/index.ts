import { CommandsRegistry, handlerLogin, registerCommand, runCommand } from "./command_handler";
function main() {
    let registry: CommandsRegistry = {

    };
    registerCommand(registry, "login", handlerLogin);
    const commandLineCommands = process.argv;
    const args = commandLineCommands.slice(2);
    if (args.length === 0) {
        console.log("You must provide a valid command!");
        process.exit(1);
    }
    const commandName = args[0];
    const restOfArguments = args.slice(1);
    try {
        runCommand(registry, commandName, ...restOfArguments);
    } catch (error) {
        console.error((error as Error).message);
        process.exit(1);
    }
}

main();