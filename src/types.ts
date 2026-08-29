export type RedisKey = {
    port: string;
    url: string;
}

export type CliStartOptions = {
    port: number;
    origin: string;
}

export type StartServerCallback = (port: number, origin: string) => void | Promise<void>;
