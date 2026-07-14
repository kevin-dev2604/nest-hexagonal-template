import { ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { LoginHistoryRepositoryPort } from "../../ports/outbound/login-history-repository.port";
import { InjectRepository } from "@nestjs/typeorm";
import { LoginHistoryEntiry } from "./orm/login-history-orm.entity";
import { DataSource, QueryFailedError } from "typeorm";
import { LoginHistory } from "../../domain/login-history.model";

@Injectable()
export class LoginHistoryRepositoryAdapter implements LoginHistoryRepositoryPort {
  constructor(
    private readonly dataSource: DataSource,
  ) { }

  async saveHistory(loginHistory: LoginHistory): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const loginHistoryEntity = manager.create(LoginHistoryEntiry, loginHistory);

        await manager.save(loginHistoryEntity);
      });

    } catch (error) {
      console.error(error);

      if (error instanceof QueryFailedError) {
        if (error.driverError?.code === '23505' || (error as any).code === '23505') {
          throw new ConflictException('Existing login history');
        } else {
          throw new InternalServerErrorException();
        }
      }
    }
  }
}