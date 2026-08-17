import redis from "redis";

const redisClient = redis.createClient();

redisClient.on("error", (err) => {
    console.error("REDIS CLIENT ERROR", err);
});

redisClient.on("ready", () => {
    console.log("Redis Client Started!!")
});

await redisClient.connect();
await redisClient.ping();

export { redisClient }