import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) { }
  getHello(): string {
    const port = this.configService.get<number>('PORT');
    return `Hello Word in ${port} port!`;
  }
}
