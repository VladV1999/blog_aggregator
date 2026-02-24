import { setUser } from "./config";
export type CommandHandler = (cmdName: string, ...args: string[]) => void;

export function handlerLogin(cmdName:string, ...args: string[]): void {
    if (args.length === 0) {
        throw new Error("The login handler must have a username!!!");
    }
    const username = args[0];
    setUser(username);
    console.log(`The user ${username}`);
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handler = registry[cmdName];
    if (!handler) throw new Error(`Unknown command: ${cmdName}`);
    handler(cmdName, ...args);
}

export type CommandsRegistry = Record<string, CommandHandler>;