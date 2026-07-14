import { TokenInfoDto } from "../../adapters/inbound/dto/token-info.dto";

export abstract class JwtPort {
  abstract generateToken(userId: number): Promise<TokenInfoDto>;
}