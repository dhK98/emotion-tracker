import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.TOKEN_SECRET,
        });
    }

    async validate(payload: { id: string; name: string }) {
        const user = await this.userRepository.findOne({
            where: {
                loginId: payload.id
            },
        });

        if (!user) {
            throw new UnauthorizedException();
        }

        // 유저의 모든 정보를 반환하거나, 필요한 정보만 골라 반환할 수 있습니다.
        return user;
    }
}