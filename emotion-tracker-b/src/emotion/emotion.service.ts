import { Injectable } from '@nestjs/common';
import { UpdateEmotionDto } from './dto/update-emotion.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Emotion } from './entities/emotion.entity';
import { Between, Repository } from 'typeorm';
import { CreateEmotionDto } from './dto/create-emotion.dto';

@Injectable()
export class EmotionService {

  constructor(
    @InjectRepository(Emotion) private readonly emotionRepository: Repository<Emotion>
  ) { }

  async create(createEmotionDto: CreateEmotionDto, user: User) {
    // 1. 현재 날짜를 가져옵니다.
    //    이때 시간, 분, 초, 밀리초를 모두 0으로 설정하여 날짜만 남깁니다.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. TypeORM의 findOne 메서드를 사용하여 오늘 날짜의 기록을 조회합니다.
    //    user: { id: user.id } 를 추가하여 특정 사용자의 기록만 조회하도록 필터를 추가했습니다.
    const isExistTodayEmotion = await this.emotionRepository.findOne({
      where: {
        user: { id: user.id },
        created_at: today,
        // Raw 쿼리를 사용하는 경우: created_at: Raw(alias => `DATE(${alias}) = CURRENT_DATE`),
      },
    });

    if (isExistTodayEmotion) {
      isExistTodayEmotion.emotion = createEmotionDto.emotion;
      isExistTodayEmotion.reason = createEmotionDto.reason;
      return await this.emotionRepository.save(isExistTodayEmotion);
    }

    const newEmotion = this.emotionRepository.create({
      ...createEmotionDto,
      user,
      created_at: today,
    });

    return await this.emotionRepository.save(newEmotion);
  }


  findAll() {
    return `This action returns all emotion`;
  }

  async findMonthlyEmotions(user: User) {
    // 1. Get the current date
    const now = new Date();

    // 2. Calculate the first day of the current month
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // 3. Use the current date as the end date for the query
    const lastDayForQuery = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    lastDayForQuery.setHours(23, 59, 59, 999);

    // 4. Use the `Between` operator to find all emotions for the user within this date range
    return await this.emotionRepository.find({
      where: {
        user: { id: user.id },
        created_at: Between(firstDayOfMonth, lastDayForQuery),
      },
      // You can add an 'order' clause if you want the results sorted, e.g., by date
      order: {
        created_at: 'ASC',
      },
    });
  }
  findOne(id: number) {
    return `This action returns a #${id} emotion`;
  }

  update(id: number, updateEmotionDto: UpdateEmotionDto) {
    return `This action updates a #${id} emotion`;
  }

  remove(id: number) {
    return `This action removes a #${id} emotion`;
  }
}
