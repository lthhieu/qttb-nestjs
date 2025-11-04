import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import type { Response } from 'express';
import { IUser } from 'src/users/users.interface';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { LoginBySocial } from 'src/auth/dto/login-by-social.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(username);
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user?.password)
            if (isValid) {
                const { password, ...result } = user;
                return user;
            }
        }
        return null;
    }

    async afterAuthed(user: IUser, response: Response) {
        const { _id, email, fullname } = user;
        const payload = { _id, email, fullname };
        const refreshToken = this.refreshToken(payload);
        const userUpdateRefreshToken = await this.usersService.updateRefreshToken(refreshToken, _id);
        response.cookie('refresh-token', refreshToken, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>('REFRESH_TOKEN_EXPIRE'))
        })
        const { refreshToken: token, password, ...result } = userUpdateRefreshToken!;

        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: refreshToken,
            user: result
        };
    }

    async login(user: IUser, response: Response) {
        return this.afterAuthed(user, response)
    }

    async createBySocial(data: LoginBySocial, response: Response) {
        const user = await this.usersService.createBySocial(data)
        //login
        const { _id, email, fullname } = user;
        return this.afterAuthed({ _id: _id.toString(), email, fullname }, response)
    }

    refreshToken(payload: any) {
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRE')
        })
        return refreshToken;
    }

    async logout(user: IUser, response: Response) {
        const { _id } = user
        await this.usersService.updateRefreshToken(null, _id)
        response.clearCookie('refresh-token')
        return 'ok'
    }

    async refresh(token: string, response: Response) {
        try {
            this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET')
            })
            const user = await this.usersService.findOneByToken(token)
            if (user) {
                const { _id, email, fullname } = user;
                const payload = { _id, email, fullname };
                const newRefreshToken = this.refreshToken(payload);
                await this.usersService.updateRefreshToken(newRefreshToken, _id.toString());
                response.cookie('refresh-token', newRefreshToken, {
                    httpOnly: true,
                    maxAge: ms(this.configService.get<string>('REFRESH_TOKEN_EXPIRE'))
                })
                return {
                    access_token: this.jwtService.sign(payload),
                    user: { _id, email, fullname }
                };
            } else {
                throw new BadRequestException('Something went wrong')
            }
        } catch (e) {
            throw new BadRequestException('Refresh token hết hiệu lực. Vui lòng đăng nhập!')
        }
    }
}
