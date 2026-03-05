import { deleteAllUsers } from "../lib/db/queries/users";
export async function handlerReset(cmdName: string, ...args: string[]): Promise<void> {
    const res = await deleteAllUsers();
    if (res === undefined) {
        console.log("There were no users in the database, nothing to delete");
        return;
    }
    console.log("Successfully deleted all users");
}