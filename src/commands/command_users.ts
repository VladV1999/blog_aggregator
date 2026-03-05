import { createUser, getUser, getUsers } from "../lib/db/queries/users";
import { readConfig, setUser } from "./config";
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

export async function handlerListUsers(cmdName: string, ...args: string[]): Promise<void> {
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