import { UpdatePasswordDto } from "../../adapters/inbound/dto/update-password.dto";
import { UpdateUserProfileDto } from "../../adapters/inbound/dto/update-user-profile.dto";
import { UserProfileDto } from "../../adapters/inbound/dto/user-profile.dto";

export abstract class UserUseCase {
  abstract getUserProfile(userId: number): Promise<UserProfileDto>;
  abstract updateUserProfile(userId: number, updateUserProfileDto: UpdateUserProfileDto): Promise<void>;
  abstract updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto): Promise<void>;
}