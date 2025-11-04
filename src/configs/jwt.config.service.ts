import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModuleOptions, JwtOptionsFactory } from "@nestjs/jwt";

@Injectable()
export class JWTConfigService implements JwtOptionsFactory {
    constructor(private configService: ConfigService) { }
    createJwtOptions(): JwtModuleOptions {
        const secret = this.configService.get<string>('JWT_SECRET');
        const access_token_expire = this.configService.get<string>('ACCESS_TOKEN_EXPIRE');
        return {
            secret,
            signOptions: { expiresIn: access_token_expire }
        }
    }
}