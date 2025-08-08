import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { EmotionService } from './emotion.service';
import { CreateEmotionDto } from './dto/create-emotion.dto';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/common/decorator/user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('emotions')
@UseGuards(JwtAuthGuard)
export class EmotionController {
  private readonly logger = new Logger('EmotionController')
  constructor(private readonly emotionService: EmotionService) { }

  @Post()
  async create(@Body() createEmotionDto: CreateEmotionDto, @UserInfo() user: User) {
    try {
      const newEmotion = await this.emotionService.create(createEmotionDto, user);
      return { success: true, data: newEmotion };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'CREATION_FAILED',
            message: '감정 기록 생성에 실패했습니다.',
            details: error.message,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('monthly')
  async findMonthlyEmotions(@UserInfo() user: User, @Query('year') year: string, @Query('month') month: string) {
    try {
      if (!year || !month) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'year와 month는 필수 쿼리 파라미터입니다.',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const emotions = await this.emotionService.findEmotionsByMonthAndYear(user, parseInt(year), parseInt(month));      // 명세에 맞게 "data" 필드에 배열을 담아서 반환
      return emotions;
    } catch (error) {
      this.logger.error(error)
    }
  }


  @Get('yearly-stats')
  async findYearlyStats(@UserInfo() user: User, @Query('year') year: string) {
    if (!year) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'year는 필수 쿼리 파라미터입니다.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const stats = await this.emotionService.getYearlyEmotionStats(user, parseInt(year));

    return { data: stats };
  }
}