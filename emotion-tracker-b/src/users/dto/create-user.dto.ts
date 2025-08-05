import { IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    /** login id */
    @IsNotEmpty()
    @IsString()
    id: string


    /** login password */
    @IsNotEmpty()
    @IsString()
    password: string


    /** user name */
    @IsNotEmpty()
    @IsString()
    name: string;
}
