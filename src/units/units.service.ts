import { Injectable } from '@nestjs/common';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Unit } from 'src/units/schemas/unit.schema';
import { Model } from 'mongoose';

@Injectable()
export class UnitsService {
  constructor(@InjectModel(Unit.name) private unitModel: Model<Unit>,) { }

  async create(createUnitDto: CreateUnitDto) {
    const { name } = createUnitDto
    let newUnit = await this.unitModel.create({ name })
    return newUnit;
  }

  async findAll() {
    return await this.unitModel.find();
  }

  async findOne(id: string) {
    return await this.unitModel.findById(id);
  }

  async update(id: string, updateUnitDto: UpdateUnitDto) {
    return await this.unitModel.findByIdAndUpdate(id, updateUnitDto);
  }

  async remove(id: string) {
    return await this.unitModel.findByIdAndDelete(id);
  }
}
