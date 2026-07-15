import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RedisModule } from './common/infrastructure/redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoModule } from './todo/todo.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './common/config/configuration';
import { SnakeNamingStartegy } from './common/strategies/snake-naming.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      // 1. 먼저 .env 파일을 읽어 process.env에 등록합니다.
      envFilePath: '.env',

      // 2. .env 값을 바탕으로 YML 파일을 읽어 치환하는 커스텀 로더를 등록합니다.
      load: [configuration],

      // 3. 애플리케이션 전체에서 ConfigService를 바로 쓸 수 있게 전역(Global) 설정합니다.
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      // ConfigModule을 위에서 전역(isGlobal: true)으로 등록했더라도,
      // 가독성과 명확성을 위해 imports에 명시해 주는 것이 좋습니다.
      imports: [ConfigModule],

      // DI 컨테이너에 "이 모듈에서 ConfigService를 주입해줘!"라고 요청합니다.
      inject: [ConfigService],

      // 위 inject 선언 덕분에, useFactory의 파라미터로 ConfigService 인스턴스가 주입됩니다.
      useFactory: (configService: ConfigService) => {
        // 이 안에서 YML과 .env의 주입 결과를 자유롭게 가공하여 리턴합니다.
        return {
          type: configService.get<'postgres'>('db.type'),
          host: configService.get<string>('db.host'),
          port: Number(configService.get<number>('db.port')),
          username: configService.get<string>('db.username'),
          password: configService.get<string>('db.password'),
          database: configService.get<string>('db.database', 'my_default_db'), // 두 번째 인자로 기본값 설정도 가능

          entities: [__dirname + '/**/*.entity{.ts,.js}'],

          // 개발/로컬 환경일 때만 동기화(synchronize)를 활성화하도록 제어 가능
          synchronize: configService.get<string>('NODE_ENV') !== 'production',

          // ⚠️ 이 부분이 제대로 들어가 있는지 꼭 확인해 보세요!
          namingStrategy: new SnakeNamingStartegy(),

          logging: configService.get<boolean>('db.logging', true),
        }
      },
    }),
    RedisModule,
    AuthModule,
    UserModule, TodoModule,
  ],
})
export class AppModule { }
