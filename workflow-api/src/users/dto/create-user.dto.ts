// create-user.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Role } from "../entities/user.entity";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
    
    @IsEnum(Role)
    role: Role;

    @IsString()
    @IsOptional()
    description: string;
}
