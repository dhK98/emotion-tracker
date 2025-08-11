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
    const existingEmotion = await this.emotionRepository.findOne({
      where: {
        user: { id: user.id },
        date: createEmotionDto.date,
      },
    });

    if (existingEmotion) {
      existingEmotion.emotion = createEmotionDto.emotion;
      existingEmotion.reason = createEmotionDto.reason;
      return await this.emotionRepository.save(existingEmotion);
    }

    const newEmotion = this.emotionRepository.create({
      emotion: createEmotionDto.emotion,
      reason: createEmotionDto.reason,
      date: createEmotionDto.date,
      user
    });

    return await this.emotionRepository.save(newEmotion);
  }

  async findEmotionsByMonthAndYear(user: User, year: number, month: number): Promise<Emotion[]> {
    const { firstDay, lastDay } = getFirstAndLastDayOfMonth(year, month);

    const emotions = await this.emotionRepository.find({
      where: {
        user: { id: user.id },
        date: Between(format(firstDay, 'yyyy-MM-dd'), format(lastDay, 'yyyy-MM-dd')),
      },
      order: {
        date: 'ASC',
      },
    });

    return emotions.map(e => ({
      date: e.date,
      emotion: e.emotion,
      reason: e.reason || null,
    })) as Emotion[];
  }

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
