import dotenv from "dotenv"; 
import { Command } from "commander";

import { redisClient } from "./redisService.js";
import type { CliStartOptions, StartServerCallback } from "../types.js";

dotenv.config();

export const runCLI = (startServerCallback: StartServerCallback): void => {
    
    const cliTool = new Command();

    cliTool
        .name("caching-proxy")
        .description("CLI tool for caching proxy and cache management");

    cliTool
        .command("start", { isDefault: true })
        .description("Startet eine Proxy-Instanz")
        .requiredOption("-p, --port <number>", "Port für diese Proxy-Instanz", (val) => parseInt(val, 10))
        .requiredOption("-o, --origin <string>", "Ziel-URL für diese Proxy-Instanz")
        .action(async (opts: CliStartOptions) => {
            if (isNaN(opts.port)) {
                console.error("Error: invalid port number");
                process.exit(1);
            }
            
            await startServerCallback(opts.port, opts.origin);
        });

    cliTool
        .command("clear-cache")
        .description("empties the whole cli-cache")
        .action(async () => {
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
        });

    cliTool.parseAsync(process.argv);
};
