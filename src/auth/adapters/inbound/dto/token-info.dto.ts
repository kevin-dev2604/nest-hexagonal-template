export class TokenInfoDto {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
  ) {}
}