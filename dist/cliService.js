import { Command } from "commander";
const cliTool = new Command();
cliTool
    .name("caching-proxy")
    .allowExcessArguments(true)
    .option("--port <number>", "Port for the proxy server")
    .option("--origin <string>", "Origin URL to redirect to")
    .parse(process.argv);
export const options = cliTool.opts();
export default cliTool;
