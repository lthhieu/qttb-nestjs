import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/auth/passport/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JWTConfigService } from 'src/configs/jwt.config.service';
import { JwtStrategy } from 'src/auth/passport/jwt.strategy';

@Module({
  imports: [UsersModule, PassportModule,
    JwtModule.registerAsync({
      useClass: JWTConfigService,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy]
})
export class AuthModule { }
