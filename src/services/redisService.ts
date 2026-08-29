import redis from "redis";

const redisUrl = process.env["REDIS_URL"] || "redis://localhost:6379";

const redisClient = redis.createClient({
    url:redisUrl
});

redisClient.on("error", (err) => {
    console.error("REDIS CLIENT ERROR", err);
});

redisClient.on("ready", () => {
    console.log("Redis Client Started!!");
});

export { redisClient };