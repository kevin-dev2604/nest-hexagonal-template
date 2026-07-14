import { LoginHistory } from "../../domain/login-history.model";

export abstract class LoginHistoryRepositoryPort {
  abstract saveHistory(loginHistory: LoginHistory): Promise<void>;
}