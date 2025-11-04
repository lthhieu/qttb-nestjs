import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Position, PositionSchema } from 'src/positions/schemas/position.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Position.name, schema: PositionSchema }])],
  controllers: [PositionsController],
  providers: [PositionsService],
})
export class PositionsModule { }
