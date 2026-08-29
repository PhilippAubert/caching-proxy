# Caching Proxy CLI

A lightweight, robust Command Line Interface (CLI) tool that acts as a caching proxy server. It forwards HTTP requests to an origin server, caches the responses in a local Redis database, and serves subsequent requests directly from the cache to improve response times and reduce network traffic.

This project is built with Node.js, TypeScript, Express 5, and Commander, fully satisfying the requirements of the [roadmap.sh Caching Server Project](https://roadmap.sh/projects/caching-server).

## Features

- **Dynamic Proxying:** Forwards all HTTP paths, query parameters, and methods to your designated origin server.
- **Efficient Caching:** Utilizes an in-memory Redis database to store and retrieve responses instantly.
- **Content-Type Preservation:** Transparently caches and serves any payload format, including JSON, HTML, and plain text.
- **Cache Tracking:** Automatically injects custom headers (`X-Cache: HIT` or `X-Cache: MISS`) into responses to track delivery performance.
- **Cache Management:** Simple CLI flag to clear the entire proxy database instantly.

---

## Prerequisites

Before running the CLI tool, ensure you have the following installed on your machine:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Docker & Docker Compose** (for running the Redis caching layer)

---

## Getting Started

### 1. Clone & Install Dependencies

Navigate into your project root folder and install all required Node packages:

```bash
npm install
```

### 2. Build the TypeScript Source

Compile the TypeScript files into executable JavaScript inside the `dist` directory:

```bash
npm run build
```

### 3. Link the CLI Globally

Create a global symlink on your local machine so you can run the `caching-proxy` command from any terminal directory:

```bash
npm link
```

### 4. Start the Infrastructure

Launch the pre-configured Redis database container using Docker Compose:

```bash
docker compose up -d
```
*Tip: You can optionally access **RedisInsight** at `http://localhost:8001` to monitor your cached keys visually.*

---

## Usage Syntax

Following the strict specifications, the CLI tool operates directly via root-level flags without extra subcommands.

### Start the Caching Proxy Server

Run the server by providing a custom local port and your target origin URL:

```bash
caching-proxy --port 3000 --origin https://dummyjson.com
```

**Expected terminal output:**
```text
Redis Client Started!!
caching proxy is up and running
   - listening locally on port: 3000
   - forwarding all traffic to: https://dummyjson.com
```

### Clear the Cache

To flush all stored responses from your local Redis cache, execute the following command:

```bash
caching-proxy --clear-cache
```

**Expected terminal output:**
```text
🗑️ Redis-Cache cleared successfully!
```

---

## Verification & Testing

To confirm that the cache layer is operating correctly, use a terminal tool like `curl` to inspect response headers.

### Step 1: Execute the initial request (Cache MISS)
```bash
curl -I http://localhost:3000/products
```
The proxy will fetch the data from the origin server. Look for the custom tracking header:
```text
X-Cache: MISS
```

### Step 2: Execute the identical request again (Cache HIT)
```bash
curl -I http://localhost:3000/products
```
The proxy fetches the response directly out of Redis. Response times will decrease significantly, and the header changes to:
```text
X-Cache: HIT
```

## Tech Stack

- **Runtime:** Node.js (TypeScript)
- **Framework:** Express 5 (Native path parsing & routing middleware)
- **CLI Parsing:** Commander.js
- **Database:** Redis (Dockerized)
