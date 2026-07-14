import { IsNotEmpty, MinLength } from "class-validator";

export class AuthCredentialDto {
  @IsNotEmpty()
  public readonly loginId!: string;

  @IsNotEmpty()
  @MinLength(8)
  public readonly loginPw!: string;

  constructor(loginId: string, loginPw: string) {
    this.loginId = loginId;
    this.loginPw = loginPw;
  }
}