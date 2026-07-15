import { Global, Inject, Module, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const stage = process.env.NODE_ENV || 'local';

        if (stage === 'production') {
          const redisUrl = configService.get<string>('redis.url');

          if (!redisUrl) {
            throw new Error('REDIS_URL이 .env 파일에 정의되어 있지 않습니다.');
          }

          // ioredis 인스턴스 생성 및 반환
          return new Redis(redisUrl, {
            // Upstash 연결 안정성을 위한 추가 옵션 (선택)
            maxRetriesPerRequest: 3,
          });

        } else {
          const host = configService.get<string>('redis.host');
          const port = Number(configService.get<number>('redis.port'));

          if (!host || !port) {
            throw new Error('redis.host, redis.port 설정값이 .env 파일에 정의되어 있지 않습니다.');
          }

          return new Redis({
            host,
            port,
            password: configService.get<string>('redis.password'),
            db: Number(configService.get<number>('redis.db')),
          });
        }
      },
      inject: [ConfigService]
    }
  ],
  exports: [REDIS_CLIENT]
})
export class RedisModule implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) { }

  onModuleDestroy() {

  }
}