import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from 'src/configs/mongoose.config.service';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { FilesModule } from './files/files.module';
import { UnitsModule } from './units/units.module';
import { PositionsModule } from './positions/positions.module';
import { UserPositionsModule } from './user-positions/user-positions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    MongooseModule.forRootAsync({ useClass: MongooseConfigService }),
    PostsModule,
    AuthModule,
    UsersModule,
    FilesModule,
    UnitsModule,
    PositionsModule,
    UserPositionsModule
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule { }
