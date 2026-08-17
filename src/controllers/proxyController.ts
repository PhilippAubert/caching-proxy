import { type Request, type Response } from "express";
import { redisClient } from "../services/redisService.js";
import { options } from "../services/cliService.js";
import type { RedisKey } from "../types.js";

const port = options["port"] ? Number(options["port"]) : 3000;
const origin = options["origin"];

export const clearCacheIfFlagPresent = async (): Promise<void> => {
    if (options["clear-cache"]) {
        console.log("--clear-cache detected in Controller: Clearing all keys from Redis...");
        try {
            await redisClient.flushDb();
            console.log("Redis-Cache cleared successfully!");
        } catch (err) {
            console.error("Failed to clear cache on startup:", err);
        }
    }
};

export const handleCacheProxy = async (req: Request, res: Response): Promise<void> => {
   try {
        const path = req.params["splat"] || "";
        
        if (!path || path.length === 0) {
            res.status(200).json({ message: "Caching-Proxy running!" });
            return;
        }
        
        const queryIndex = req.url.indexOf("?");
        const queryString = queryIndex !== -1 ? req.url.substring(queryIndex) : "";
        const fullTargetUrl = `${origin}/${path}${queryString}`;

        const key: RedisKey = {
            "port": `${port}`,
            "url": fullTargetUrl
        };

        const redisKey = JSON.stringify(key);
        const ownedByRedis = await redisClient.get(redisKey); 

        if (ownedByRedis) {
            const cachedData = JSON.parse(ownedByRedis);
            res.status(200).set("X-Cache", "HIT").json(cachedData);
            return;
        } 

        const response = await fetch(fullTargetUrl);

        if (!response.ok) {
            res.status(response.status).send("Some error fetching the data");
            return;
        }

        const data = await response.json();
        await redisClient.set(redisKey, JSON.stringify(data));
        res.status(200).set("X-Cache", "MISS").json(data);

    } catch (e) {
        res.status(500).send("Something's off!");
    }
};
