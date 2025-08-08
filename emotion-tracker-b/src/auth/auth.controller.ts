import { Body, Controller, InternalServerErrorException, Logger, Post, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from 'src/dto/auth.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';


@Controller('auth')
export class AuthController {
    private readonly logger = new Logger('AuthController')
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        try {
            const user = await this.usersService.findOneWithLoginId(loginDto.id)
            if (!user) {
                throw new UnauthorizedException('not found user')
            }
            const isMatch = await bcrypt.compare(loginDto.password, user.password);
            if (!isMatch) {
                throw new UnauthorizedException(`no match password`)
            }
            const token = await this.authService.gTokenLogin({
                id: user.loginId,
                name: user.name
            })
            return { token, user }
        } catch (error: any) {
            this.logger.error(error)
            throw new InternalServerErrorException(error)
        }
    }
}
