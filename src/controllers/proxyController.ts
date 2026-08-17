
import { type Request, type Response } from "express";
import { redisClient } from "../services/redisService.js";
import { options } from "../services/cliService.js";
import type { RedisKey } from "../types.js";


const port = options["port"] ? Number(options["port"]) : 3000;
const origin = options["origin"];

export const handleCacheProxy = async (req:Request, res:Response): Promise<void> => {
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
}