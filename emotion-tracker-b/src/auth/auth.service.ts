import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
    ) { }

    async gTokenLogin(payload: any) {
        try {
            const { id, name } = payload;

            const accessToken = this.jwtService.sign(
                { id, name },
                {
                    expiresIn: process.env.TOKEN_EXPIRE || '1d',
                    algorithm: 'HS256',
                },
            )
            return accessToken
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }


}