import { Global, Inject, Module, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import config from "config";
import { RedisConfig } from "../../configs/global-types";

const redisConfig = config.get<RedisConfig>('redis');

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || redisConfig.host,
          port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : redisConfig.port,
          password: process.env.REDIS_PASSWORD || redisConfig.password,
          db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : redisConfig.db,
        });
      }
    }
  ],
  exports: [REDIS_CLIENT]
})
export class RedisModule implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  onModuleDestroy() {
    
  }
}