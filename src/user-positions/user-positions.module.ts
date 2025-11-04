import { Module } from '@nestjs/common';
import { UserPositionsService } from './user-positions.service';
import { UserPositionsController } from './user-positions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserPosition, UserPositionSchema } from 'src/user-positions/schemas/user-position.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserPosition.name, schema: UserPositionSchema }])],
  controllers: [UserPositionsController],
  providers: [UserPositionsService],
})
export class UserPositionsModule { }
