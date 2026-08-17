#!/usr/bin/env node

import express from "express";
import { options } from "./services/cliService.js";
import { handleCacheProxy, clearCacheIfFlagPresent } from "./controllers/proxyController.js";
import { redisClient } from "./services/redisService.js";

if (!options["origin"]) {
    console.error("Error: --origin <url> is required to start the server.");
    process.exit(1);
}

const server = express();
server.use(express.json());

const port = options["port"] ? Number(options["port"]) : 4000;

server.get("/{*splat}", handleCacheProxy);

try {
    await redisClient.connect();
    await redisClient.ping();

    await clearCacheIfFlagPresent();

    server.listen(port, "0.0.0.0", () => {
        console.log(`Server listening on http://0.0.0:${port}`);
        console.log(`Proxying traffic to: ${options["origin"]}`);
    }
);

} catch (err) {
    console.error("Critical: Server failed to start!", err);
    process.exit(1);
}
