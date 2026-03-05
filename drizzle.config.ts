import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/commands/config";

const config = readConfig();

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "src/db/",
  dialect: "postgresql",
  dbCredentials: {
    url: config.dbUrl,
  },
});