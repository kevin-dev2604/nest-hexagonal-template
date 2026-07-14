import { JwtPort } from "./jwt.port";

export abstract class AuthRepositoryPort extends JwtPort{
  abstract saveRefreshToken(userId: number, token: string): Promise<void>;
  abstract getRefreshToken(userId: number): Promise<string | null>;
  abstract removeRefreshToken(userId: number): Promise<void>;
}