import { Command } from "commander";
import dotenv from "dotenv"; 


dotenv.config();

const cliTool = new Command();

console.log("HERE, ", process.env["TARGET_URL"])

cliTool
    .name("caching-proxy")
    .allowExcessArguments(true)
    .option("--port <number>", "Port for the proxy server", (val) => parseInt(val, 10), parseInt(process.env["PORT"] || "3000", 10)
)   .option("--origin <string>", "Origin URL to redirect to", process.env["TARGET_URL"])
    .parse(process.argv); 

export const options = cliTool.opts();
export default cliTool;