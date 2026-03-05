import { getUser } from "../lib/db/queries/users";
import { User } from "../lib/db/schema";
import { readConfig } from "./config";
export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handler = registry[cmdName];
    if (!handler) throw new Error(`Unknown command: ${cmdName}`);
    await handler(cmdName, ...args);
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
export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;
export type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;
export type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler