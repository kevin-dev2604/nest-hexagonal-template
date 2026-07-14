import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import config from "config";
import { DbConfig } from "./global-types";
import { SnakeNamingStartegy } from "../strategies/snake-naming.strategy";

const dbConfig = config.get<DbConfig>('db');

export const typeORMConfig: TypeOrmModuleOptions = {
  type: dbConfig.type,
  host: process.env.RDS_HOSTNAME || dbConfig.host,

  // 💡 RDS_PORT가 있으면 정수로 변환(parseInt)하고, 없으면 기존 dbConfig.port를 씁니다.
  port: process.env.RDS_PORT ? parseInt(process.env.RDS_PORT, 10) : dbConfig.port,

  username: process.env.RDS_USERNAME || dbConfig.username,
  password: process.env.RDS_PASSWORD || dbConfig.password,
  database: process.env.RDS_DATABASE || dbConfig.database,

  entities: [__dirname + '/../../**/*.entity.{js,ts}'],

  namingStrategy: new SnakeNamingStartegy(),
  
  synchronize: dbConfig.synchronize
}