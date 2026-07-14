import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    public readonly loginId!: string;

    @IsNotEmpty()
    @MinLength(8)
    public readonly loginPw!: string;

    @IsNotEmpty()
    public readonly username!: string;
}