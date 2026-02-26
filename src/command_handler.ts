import { setUser } from "./config";
import { createUser, getUser } from "./lib/db/queries/users";
export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

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

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length != 1) {
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

export type CommandsRegistry = Record<string, CommandHandler>;