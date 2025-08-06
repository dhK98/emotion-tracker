import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, HttpStatus, HttpException } from '@nestjs/common';
import { EmotionService } from './emotion.service';
import { CreateEmotionDto } from './dto/create-emotion.dto';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/common/decorator/user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { Emotion } from './entities/emotion.entity';

@Controller('emotions') // 'emotion' -> 'emotions'로 변경하여 RESTful하게 통일
@UseGuards(JwtAuthGuard) // 컨트롤러 전체에 가드 적용
export class EmotionController {
  constructor(private readonly emotionService: EmotionService) { }

  // 1. 감정 저장 API (POST /emotions)
  @Post()
  async create(@Body() createEmotionDto: CreateEmotionDto, @UserInfo() user: User) {
    try {
      const newEmotion = await this.emotionService.create(createEmotionDto, user);
      return { success: true, data: newEmotion };
    } catch (error) {
      // 에러 응답 포맷에 맞게 HttpException을 사용
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

  // 2. 월별 감정 데이터 조회 API (GET /emotions/monthly?year=2024&month=8)
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

      const emotions = await this.emotionService.findEmotionsByMonthAndYear(user, parseInt(year), parseInt(month));
      console.log(emotions)
      // 명세에 맞게 "data" 필드에 배열을 담아서 반환
      return emotions;
    } catch (error) {
      console.log(error)
    }
  }

  // 3. 연간 통계 조회 API (GET /emotions/yearly-stats?year=2024)
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

    // 명세에 맞게 "data" 필드에 객체를 담아서 반환
    return { data: stats };
  }

  // 기존에 있던 findAll, findOne, update, remove는 API 명세에 없어 제거했습니다.
  // 필요한 경우 명세를 추가하고 다시 구현할 수 있습니다.

}