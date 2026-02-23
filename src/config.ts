import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
    dbUrl: string;
    currentUserName?: string;
};

export function setUser(username: string): void {
    const cfg = readConfig();
    cfg.currentUserName = username;
    writeConfig(cfg);
}

export function readConfig(): Config {
    const filePath = getConfigFilePath();
    const rawContents = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(rawContents);
    const config = {
        dbUrl: parsed.db_url,
        currentUserName: parsed.current_user_name,
    };
    return config;
}

function getConfigFilePath(): string {
    return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(cfg: Config): void {
    const raw = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName,
    }
    fs.writeFileSync(getConfigFilePath(), JSON.stringify(raw, null, 2), "utf-8");
}

function validateConfig(rawConfig: any): Config {
    if (rawConfig === null||typeof rawConfig !== 'object') {
        throw new Error('The raw config given is not an object!');
    }
    if (!Object.hasOwn(rawConfig, 'db_url')) {
        throw new Error('The raw config given does not have db_url property!');
    }
    return {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name,
    };
};