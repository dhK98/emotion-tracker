import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EmotionService } from './emotion.service';
import { CreateEmotionDto } from './dto/create-emotion.dto';
import { UpdateEmotionDto } from './dto/update-emotion.dto';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/common/decorator/user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('emotion')
export class EmotionController {
  constructor(private readonly emotionService: EmotionService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createEmotionDto: CreateEmotionDto, @UserInfo() user: User) {
    return this.emotionService.create(createEmotionDto, user);
  }

  @Get()
  findAll() {
    return this.emotionService.findAll();
  }

  @Get('monthly')
  @UseGuards(JwtAuthGuard)
  findMonthlyEmotions(@UserInfo() user: User) {
    return this.emotionService.findMonthlyEmotions(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emotionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmotionDto: UpdateEmotionDto) {
    return this.emotionService.update(+id, updateEmotionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emotionService.remove(+id);
  }
}
