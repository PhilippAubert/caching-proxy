#!/usr/bin/env node

import express, { type Application } from "express";
import { runCLI } from "./services/cliService.js"; 
import { createCacheProxyHandler } from "./controllers/proxyController.js";
import { redisClient } from "./services/redisService.js";

const startServer = async (port: number, origin: string): Promise<void> => {
    const server: Application = express();
    
    server.use(express.json());

    server.all("*any", createCacheProxyHandler(port, origin));

    try {
        await redisClient.connect();
        await redisClient.ping();

        server.listen(port, () => {
            console.log("caching proxy is up and running");
            console.log(`   - listening locally on port: ${port}`);
            console.log(`   - forwarding all traffic to: ${origin}`);
        });
    } catch (err) {
        console.error("critical error starting the server!", err);
        process.exit(1);
    }
};

runCLI(startServer);
