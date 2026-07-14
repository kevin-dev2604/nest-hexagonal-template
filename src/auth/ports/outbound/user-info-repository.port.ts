import { User } from "../../domain/user.model";

export abstract class UserInfoRepositoryPort {
  abstract createUser(user: User): Promise<void>;
  abstract getUserInfo(loginIdStr: string): Promise<User>;
  abstract getSocialUserInfo(email: string): Promise<User | null>;
  abstract getUserInfoByUserId(userId: number): Promise<User | null>;
  abstract updateUserInfo(user: User): Promise<void>;
}