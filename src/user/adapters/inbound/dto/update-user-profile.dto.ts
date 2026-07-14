import { IsEmail, IsNotEmpty, IsUrl } from "class-validator";

export class UpdateUserProfileDto {
  @IsNotEmpty()
  public readonly username!: string;

  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  public readonly email?: string;

  @IsUrl()
  public readonly picture?: string;
}