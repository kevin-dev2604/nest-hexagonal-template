interface UserProps {
  userId?: number;
  loginId: string;
  loginPw: string;
  username: string;
  provider?: string;
  email?: string;
  picture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly userId?: number;
  public readonly loginId: string;
  private loginPw: string;

  // user informations
  private username: string;
  private email?: string;
  private picture?: string;

  public readonly provider?: string;

  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: UserProps) {
    this.userId = props.userId;
    this.loginId = props.loginId;
    this.loginPw = props.loginPw;
    this.username = props.username;
    this.provider = props.provider;
    this.email = props.email;
    this.picture = props.picture;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * getters
   */
  public get encodedPassword(): string {
    return this.loginPw;
  }

  public get usernameValue(): string {
    return this.username;
  }

  public get emailValue(): string | undefined {
    return this.email;
  }

  public get pictureValue(): string | undefined {
    return this.picture;
  }

  /**
   * changePassword
   */
  public changePassword(newPassword: string): void {
    this.loginPw = newPassword;
  }

  /**
   * updateInfo
   */
  public updateInfo(username: string, email?: string, picture?: string): void {
    this.username = username;
    this.email = email;
    this.picture = picture;
  }

}