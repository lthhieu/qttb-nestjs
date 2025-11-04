import { Module } from '@nestjs/common';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Unit, UnitSchema } from 'src/units/schemas/unit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }])],
  controllers: [UnitsController],
  providers: [UnitsService],
})
export class UnitsModule { }
