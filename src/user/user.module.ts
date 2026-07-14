import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './adapters/inbound/user.controller';
import { UserService } from './user.service';
import { UserUseCase } from './ports/inbound/user.usecase';

@Module({
  imports: [
    AuthModule
  ],
  controllers: [UserController],
  providers: [
    // =======================================================
    // 2. Inbound 영역 (Driving UseCase & Service)
    // =======================================================
    // [실체 인스턴스] 비즈니스 로직을 수행하는 서비스를 등록합니다.
    // 💡 이때 AuthService 내부 생성자에서 위에서 정의한 포트들을 안전하게 주입받습니다.
    UserService,

    // [상황 A/B 지원] 자식 유즈케이스 타입으로 주입받는 곳에 서비스를 연결
    {
      provide: UserUseCase,
      useExisting: UserService,
    },
    // [상황 B 지원] 공통/부모 유즈케이스 타입으로 주입받는 곳에도 '동일한' 서비스 인스턴스를 연결 (지금은 미사용)
  ],
  exports: []
})
export class UserModule { }
