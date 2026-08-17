#!/usr/bin/node

import express from "express";
import { options } from "./services/cliService.js";
import { handleCacheProxy } from "./controllers/proxyController.js";

const server = express();
server.use(express.json());

const port = options["port"] ? Number(options["port"]) : 3000;

server.get("/{*splat}", handleCacheProxy);

server.listen(port, () => console.log(`server listening on http://localhost:${port}`));