import dotenv from "dotenv"; 
import { Command } from "commander";
import { redisClient } from "./redisService.js";
import type { StartServerCallback } from "../types.js";

dotenv.config();

export const runCLI = (startServerCallback: StartServerCallback): void => {
    const cliTool = new Command();

    cliTool
        .name("caching-proxy")
        .description("CLI tool for caching proxy and cache management")
        .version("1.0.0")
        .option("-p, --port <number>", "port for this proxy-instance", (val) => parseInt(val, 10))
        .option("-o, --origin <string>", "target url for this proxy instance")
        .option("--clear-cache", "empties the whole cli-cache")
        .action(async (opts) => {
            if (opts.clearCache) {
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

            if (opts.port && opts.origin) {
                if (isNaN(opts.port)) {
                    console.error("Error: invalid port number");
                    process.exit(1);
                }
                await startServerCallback(opts.port, opts.origin);
                return;
            }

            console.error("Error: Please provide either --port AND --origin to start, or --clear-cache to reset.");
            cliTool.outputHelp();
            process.exit(1);
        });

    cliTool.parseAsync(process.argv);
};
