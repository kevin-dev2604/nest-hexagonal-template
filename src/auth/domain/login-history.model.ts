interface HistoryProps {
  id?: number;
  loginId: string;
  isSuccess: boolean;
  createdAt?: Date;
  createdBy: number;
}

export class LoginHistory {
  public readonly id?: number;
  public readonly loginId: string;
  public readonly isSuccess: boolean;
  public readonly createdAt?: Date;
  public readonly createdBy: number;

  constructor(props: HistoryProps) {
    this.id = props.id;
    this.loginId = props.loginId;
    this.isSuccess = props.isSuccess;
    this.createdAt = props.createdAt;
    this.createdBy = props.createdBy;
  }
}