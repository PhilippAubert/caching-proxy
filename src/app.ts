#!/usr/bin/node

import express, { type Request, type Response } from "express";
import { options } from "./cliService.js";

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
        
        const dummyData = await fetch(`${origin}/${path}`);
        const data = await dummyData.json();
        
        /**
         * redis: key-value pair
         * also: redisKey={
         *      port: number
         *      ulr: URL
         * }
         * value: response:body! 
         */

        res
            .status(200)
            .json(data);
    } catch (e) {
        res
            .status(500)
            .send("Something's off!");
    }
});

server.listen(port, () => console.log(`server listening on http://localhost:${port}`));
