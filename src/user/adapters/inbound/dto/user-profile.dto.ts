export class UserProfileDto {
  public readonly username: string;
  public readonly email?: string;
  public readonly provider?: string;
  public readonly picture?: string;

  constructor(
    username: string,
    email?: string,
    provider?: string,
    picture?: string
  ) {
    this.username = username;
    this.email = email;
    this.provider = provider;
    this.picture = picture;
  }
}