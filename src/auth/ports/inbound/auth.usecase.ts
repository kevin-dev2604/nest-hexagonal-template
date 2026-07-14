import { AuthCredentialDto } from "../../adapters/inbound/dto/auth-credential.dto";
import { CreateUserDto } from "../../adapters/inbound/dto/create-user.dto";
import { TokenInfoDto } from "../../adapters/inbound/dto/token-info.dto";

export abstract class AuthUseCase {
  abstract signup(createUserDto: CreateUserDto): Promise<void>;
  abstract signin(authCredentialDto: AuthCredentialDto): Promise<TokenInfoDto>;
  abstract signinOAuth(oauthUser: any, provider: string): Promise<TokenInfoDto>;
  abstract refresh(userId: number): Promise<TokenInfoDto>;
  abstract logout(userId: number): Promise<void>; 
}