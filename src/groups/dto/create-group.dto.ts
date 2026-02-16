import { IsOptional, IsString, IsUrl } from "class-validator";

export class CreateGroupDto {
    @IsString()
    name : string;

    @IsOptional()
    @IsString()
    description? : string;

    @IsOptional()
    @IsUrl()
    avatarUrl? : string;
}