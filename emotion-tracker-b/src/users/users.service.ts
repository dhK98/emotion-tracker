import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const isExistUser = await this.userRepository.findOne({
      where: {
        loginId: createUserDto.id
      }
    })
    if (isExistUser) {
      throw new ConflictException(`already exist user id: ${createUserDto.id}`)
    }
    const user = new User()
    user.loginId = createUserDto.id;
    user.name = createUserDto.name;
    const saltOrRounds = 10;
    const encryptedPassword = await bcrypt.hash(createUserDto.password, saltOrRounds);
    user.password = encryptedPassword
    return await this.userRepository.save(user)
  }

  async findAll() {
    return await this.userRepository.find()
  }

  async findOneWithLoginId(loginId: string) {
    return await this.userRepository.findOne({
      where: {
        loginId
      }
    })
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
