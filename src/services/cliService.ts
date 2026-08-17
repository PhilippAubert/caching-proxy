import { Command } from "commander";
import dotenv from "dotenv"; 

dotenv.config();

const cliTool = new Command();

cliTool
    .name("caching-proxy")
    .allowExcessArguments(true)
    .option("--port <number>", "Port for the proxy server", (val) => parseInt(val, 10), parseInt(process.env["PORT"] || "3000", 10))   
    .option("--origin <string>", "Origin URL to redirect to", process.env["TARGET_URL"])
    .option("--clear-cache", "Clear all keys from the Redis cache")
    .parse(process.argv); 

export const options = cliTool.opts();
export default cliTool;
