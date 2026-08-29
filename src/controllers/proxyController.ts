import { type Request, type Response } from "express";
import { redisClient } from "../services/redisService.js";
import type { RedisKey } from "../types.js";

export const createCacheProxyHandler = (port: number, origin: string) => {
    return async (req: Request, res: Response): Promise<void> => {
        try {
            const rawPath = req.params["any"];
            const path = Array.isArray(rawPath) ? rawPath.join("/") : (rawPath || "");
            
            if (!path || path.trim() === "") {
                res.status(200).json({ message: "Caching-Proxy running!" });
                return;
            }
            
            const queryIndex = req.url.indexOf("?");
            const queryString = queryIndex !== -1 ? req.url.substring(queryIndex) : "";
            
            const baseOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin;
            const cleanPath = path.startsWith("/") ? path : `/${path}`;
            const fullTargetUrl = `${baseOrigin}${cleanPath}${queryString}`;

            const key: RedisKey = {
                "port": `${port}`,
                "url": fullTargetUrl
            };

            const redisKey = JSON.stringify(key);
            const ownedByRedis = await redisClient.get(redisKey); 

            if (ownedByRedis) {
                const cachedData = JSON.parse(ownedByRedis);
                res.status(200)
                   .set("X-Cache", "HIT")
                   .set("Content-Type", cachedData.contentType)
                   .send(cachedData.body);
                return;
            } 

            const response = await fetch(fullTargetUrl);

            if (!response.ok) {
                res.status(response.status).send(`Error fetching data from origin: ${response.statusText}`);
                return;
            }

            const bodyText = await response.text();
            const contentType = response.headers.get("content-type") || "text/plain";
            
            const cachePayload = {
                contentType: contentType,
                body: bodyText
            };
            
            await redisClient.set(redisKey, JSON.stringify(cachePayload));
            
            res.status(200)
               .set("X-Cache", "MISS")
               .set("Content-Type", contentType)
               .send(bodyText);

        } catch (e) {
            console.error("Proxy Error:", e);
            res.status(500).send("Something's off inside the proxy!");
        }
    };
};