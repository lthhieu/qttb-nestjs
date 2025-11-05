import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from 'src/configs/mongoose.config.service';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { UnitsModule } from './units/units.module';
import { PositionsModule } from './positions/positions.module';
import { EventsModule } from './events/events.module';
import { WorkflowsModule } from './workflows/workflows.module';

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
    EventsModule,
    WorkflowsModule
  ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule { }
