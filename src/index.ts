import { readConfig, setUser } from "./config";
function main() {
    setUser("Vlad");
    console.log(readConfig());
}

main();