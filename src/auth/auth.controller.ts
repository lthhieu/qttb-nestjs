import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { LocalAuthGuard } from 'src/auth/guard/local-auth.guard';
import { Public, ResponseMessage, User } from 'src/configs/custom.decorator';
import { response, type Request, type Response } from 'express';
import type { IUser } from 'src/users/users.interface';
import { LoginBySocial } from 'src/auth/dto/login-by-social.dto';


@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ResponseMessage("Đăng nhập thành công!")
    async login(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(req.user, res);
    }

    @Public()
    @Post('login-by-social')
    @ResponseMessage('Đăng nhập thành công!')
    loginBySocial(@Body() loginBySocial: LoginBySocial, @Res({ passthrough: true }) res: Response) {
        return this.authService.createBySocial(loginBySocial, res);
    }

    @Post('logout')
    @ResponseMessage("Đăng xuất thành công!")
    logout(@User() user: IUser, @Res({ passthrough: true }) response: any) {
        return this.authService.logout(user, response);
    }

    @Get('account')
    @ResponseMessage('Tải thông tin người dùng thành công')
    async getAccount(@User() user: IUser) {
        return { user }
    }

    @Public()
    @Post('refresh')
    @ResponseMessage("Cấp lại token thành công")
    refresh(@Req() req: Request, @Res({ passthrough: true }) response: any) {
        const refreshToken = req.cookies['refresh-token'];
        return this.authService.refresh(refreshToken, response);
    }
}
