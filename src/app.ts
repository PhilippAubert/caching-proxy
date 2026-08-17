#!/usr/bin/node

import express, { type Request, type Response } from "express";
import redis from "redis";

import type { RedisKey } from "./types.js";

import { options } from "./cliService.js";

const redisClient = redis.createClient();

(async () => {
    redisClient.on("error", (err) => {
        console.error("REDIS CLIENT ERROR", err);
    });

    redisClient.on("ready", () => {
        console.log("Redis Client Started!!")
    });

    await redisClient.connect();
    await redisClient.ping();
})();

const server = express();
server.use(express.json());

const port = options["port"] ? Number(options["port"]) : 3000;
const origin = options["origin"];

server.get("/{*splat}", async (req: Request, res: Response) => {
    try {
        const path = req.params["splat"] || "";
        
        if (!path || path.length === 0) {
            res
            .status(200)
            .json({ message: "Caching-Proxy running!" });
            return;
        }
        
        const key: RedisKey = {
            "port": `${port}`,
            "url": `${origin}/${path}`
        }

        const redisKey = JSON.stringify(key);
        const ownedByRedis = await redisClient.get(redisKey); 

        if (ownedByRedis){
            const cachedData = JSON.parse(ownedByRedis);
            res.status(200).set("X-Cache", "HIT").json(cachedData);
            return;
        } 

        const response = await fetch(`${origin}/${path}`);

        if (!response.ok){
            res.status(response.status).send("Some error fetching the data")
            return;
        }

        const data = await response.json();
        await redisClient.set(redisKey, JSON.stringify(data), { EX:300 });
        res.status(200).set("X-Cache", "MISS").json(data);
    } catch (e) {
        res.status(500).send("Something's off!");
    }
});

server.listen(port, () => console.log(`server listening on http://localhost:${port}`));
