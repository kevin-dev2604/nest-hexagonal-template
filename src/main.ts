import * as dotenv from 'dotenv';
dotenv.config(); // ⚠️ 무조건 다른 어떤 NestJS 모듈 import보다 위에 선언되어야 합니다!

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from 'config';
import { ServerConfig } from './common/configs/global-types';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const serverConfig = config.get<ServerConfig>('server');

  const port = serverConfig.port;

  if (process.env.NODE_ENV !== 'production') {
    // 1. Swagger 설정 객체 생성
    const swaggerConfig = new DocumentBuilder()
      .setTitle('My Service API 템플릿') // 문서 제목
      .setDescription('사이드 프로젝트용 API 템플릿 명세서입니다.') // 문서 설명
      .setVersion('1.0.0') // API 버전
      // 1. 기존 Access Token 설정 (기본값: 'bearer'라는 이름의 인증 키)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          name: 'JWT',
          description: 'Access Token을 입력하세요',
          in: 'header',
        },
        'access-token', // 💡 Swagger 내부에서 식별할 보안 옵션 이름
      )
      // 🌟 2. Refresh Token은 커스텀 헤더 방식으로 명시 (x-refresh-token 헤더)
      .addApiKey(
        {
          type: 'apiKey',
          name: 'x-refresh-token', // 💡 Swagger와 실제 HTTP 헤더에 들어갈 Key 이름입니다.
          in: 'header',
          description: 'Refresh Token 값만 그대로 입력하세요 (Bearer 적지 않음)',
        },
        'refresh-token',
      )
      .build();

    // 2. Swagger 문서 생성
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    // 3. Swagger UI 경로 설정 (예: http://localhost:3000/api-docs)
    SwaggerModule.setup('api-docs', app, document);
    Logger.log(`Swagger API Docs available at http://localhost:${port}/api-docs`);
  }

  await app.listen(port);
  Logger.log(`Application running on port ${port}`);
}
bootstrap();
