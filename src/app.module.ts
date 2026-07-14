import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RedisModule } from './common/infrastructure/redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './common/configs/typeorm.config';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    RedisModule,
    AuthModule,
    UserModule, TodoModule,
  ],
})
export class AppModule { }
