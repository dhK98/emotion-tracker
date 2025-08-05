import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { EmotionType } from "../entities/emotion.entity";

export class CreateEmotionDto {
    @IsNotEmpty()
    @IsEnum(EmotionType)
    emotion: EmotionType

    @IsOptional()
    @IsString()
    reason?: string
}
