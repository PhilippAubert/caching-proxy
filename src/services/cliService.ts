import { Command } from "commander";
import dotenv from "dotenv"; 

import { redisClient } from "./redisService.js";

dotenv.config();

const cliTool = new Command();

cliTool
    .name("caching-proxy")
    .allowExcessArguments(true)
    .option("--port <number>", "Port for the proxy server", (val) => parseInt(val, 10), parseInt(process.env["PORT"] || "3000", 10))   
    .option("--origin <string>", "Origin URL to redirect to", process.env["TARGET_URL"])
    .option("--clear-cache", "Clear all keys from the Redis cache")
    .action(async (opts) => {
        if (opts["clear-cache"]) {
            try {
                await redisClient.connect();
                await redisClient.flushDb();
                console.log("🗑️ Redis-Cache cleared successfully!");
                await redisClient.quit();
                process.exit(0);
            } catch (err) {
                console.error("Error clearing the cache:", err);
                process.exit(1);
            }
        }
    });

await cliTool.parseAsync(process.argv); 

export const options = cliTool.opts();
export default cliTool;
