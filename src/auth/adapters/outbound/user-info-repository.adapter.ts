import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { UserInfoRepositoryPort } from "../../ports/outbound/user-info-repository.port";
import { User } from "../../domain/user.model";
import { UserInfoEntity } from "./orm/user-info-orm.entity";
import { DataSource, FindOperator, IsNull, Not, QueryFailedError } from "typeorm";

@Injectable()
export class UserInfoRepositoryAdapter implements UserInfoRepositoryPort {
  constructor(
    private readonly dataSource: DataSource
  ) { }

  async createUser(user: User): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const userInfoEntity = manager.create(UserInfoEntity, {
          loginId: user.loginId,
          loginPw: user.encodedPassword,
          username: user.usernameValue,
          provider: user.provider,
          email: user.emailValue,
          picture: user.pictureValue
        });

        await manager.save(userInfoEntity);
      });

    } catch (error) {
      console.error(error);

      if (error instanceof QueryFailedError) {
        if (error.driverError?.code === '23505' || (error as any).code === '23505') {
          throw new ConflictException('Existing username');
        } else {
          throw new InternalServerErrorException();
        }
      }
    }
  }

  async getUserInfo(loginIdStr: string): Promise<User> {
    const user: User | null = await this.findOne({ loginId: loginIdStr, provider: IsNull() });

    if (!user) {
      throw new NotFoundException(`User ${loginIdStr} is not found`);
    }

    return user!;
  }

  async getSocialUserInfo(email: string): Promise<User | null> {
    return await this.findOne({ loginId: email, provider: Not('') });
  }

  async getUserInfoByUserId(userId: number): Promise<User | null> {
    return await this.findOne({ userId });
  }

  async updateUserInfo(user: User): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.update(UserInfoEntity,
          { userId: user.userId! },
          {
            loginPw: user.encodedPassword,
            username: user.usernameValue,
            email: user.emailValue,
            picture: user.pictureValue
          }
        );
      });

    } catch (error) {
      console.error(error);

      if (error instanceof QueryFailedError) {
        if (error.driverError?.code === '23505' || (error as any).code === '23505') {
          throw new ConflictException('Existing username');
        } else {
          throw new InternalServerErrorException();
        }
      }
    }
  }

  private async findOne(where: any): Promise<User | null> {
    let userInfoEntity;

    await this.dataSource.transaction(async (manager) => {
      userInfoEntity = await manager.findOneBy(UserInfoEntity, where);
    })

    if (userInfoEntity) {
      return new User({
        userId: userInfoEntity!.userId,
        loginId: userInfoEntity!.loginId,
        loginPw: userInfoEntity!.loginPw,
        username: userInfoEntity!.username,
        provider: userInfoEntity!.provider,
        email: userInfoEntity!.email,
        picture: userInfoEntity!.picture,
        createdAt: userInfoEntity!.createdAt,
        updatedAt: userInfoEntity!.updatedAt
      });

    } else {
      return null;
    }
  }

}