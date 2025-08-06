import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Emotion, EmotionType } from './entities/emotion.entity'; // EmotionType 임포트
import { Between, Repository } from 'typeorm';
import { CreateEmotionDto } from './dto/create-emotion.dto';
import { getFirstAndLastDayOfMonth, getFirstAndLastDayOfYear } from 'src/utils/date.utils';
import { format } from 'date-fns';

@Injectable()
export class EmotionService {
  constructor(
    @InjectRepository(Emotion) private readonly emotionRepository: Repository<Emotion>
  ) { }

  async create(createEmotionDto: CreateEmotionDto, user: User): Promise<Emotion> {
    // 1. DTO에서 받은 date (YYYY-MM-DD)와 user.id를 사용하여 해당 날짜에 이미 기록이 있는지 확인합니다.
    const existingEmotion = await this.emotionRepository.findOne({
      where: {
        user: { id: user.id },
        date: createEmotionDto.date, // DTO의 date 필드를 사용
      },
    });

    if (existingEmotion) {
      // 2. 기존 기록이 있다면 업데이트합니다.
      existingEmotion.emotion = createEmotionDto.emotion;
      existingEmotion.reason = createEmotionDto.reason;
      return await this.emotionRepository.save(existingEmotion);
    }

    // 3. 기존 기록이 없다면 새로 생성합니다.
    const newEmotion = this.emotionRepository.create({
      emotion: createEmotionDto.emotion,
      reason: createEmotionDto.reason,
      date: createEmotionDto.date, // DTO의 date 필드를 명시적으로 사용
      user, // 사용자 정보 연결
    });

    return await this.emotionRepository.save(newEmotion);
  }

  // API 명세 1번: 월별 감정 데이터 조회
  async findEmotionsByMonthAndYear(user: User, year: number, month: number): Promise<Emotion[]> {
    const { firstDay, lastDay } = getFirstAndLastDayOfMonth(year, month);

    const emotions = await this.emotionRepository.find({
      where: {
        user: { id: user.id },
        // date 필드가 문자열이므로 Between 쿼리도 문자열로 비교합니다.
        date: Between(format(firstDay, 'yyyy-MM-dd'), format(lastDay, 'yyyy-MM-dd')),
      },
      order: {
        date: 'ASC',
      },
    });

    // 명세에 맞게 emotion, date, reason 필드만 반환하도록 가공
    return emotions.map(e => ({
      date: e.date,
      emotion: e.emotion,
      reason: e.reason || null, // null이면 빈 문자열 처리
    })) as Emotion[]; // 타입스크립트 에러를 무시하기 위한 임시 타입 단언 (필요시 DTO 정의 권장)
  }

  // API 명세 2번: 연간 통계 조회
  async getYearlyEmotionStats(user: User, year: number) {
    const { firstDay, lastDay } = getFirstAndLastDayOfYear(year);

    const emotions = await this.emotionRepository.find({
      where: {
        user: { id: user.id },
        date: Between(format(firstDay, 'yyyy-MM-dd'), format(lastDay, 'yyyy-MM-dd')),
      },
    });

    // 감정 통계 계산
    const stats = {
      [EmotionType.VERY_HAPPY]: 0,
      [EmotionType.HAPPY]: 0,
      [EmotionType.NEUTRAL]: 0,
      [EmotionType.SAD]: 0,
      [EmotionType.ANGRY]: 0,
    };

    emotions.forEach(emotion => {
      // enum 값을 키로 사용하여 통계 업데이트
      stats[emotion.emotion]++;
    });

    return stats;
  }
}