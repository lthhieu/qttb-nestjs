import { Injectable } from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Position } from 'src/positions/schemas/position.schema';
import { Model } from 'mongoose';

@Injectable()
export class PositionsService {

  constructor(@InjectModel(Position.name) private positionModel: Model<Position>,) { }

  async create(createPositionDto: CreatePositionDto) {
    const { name } = createPositionDto
    let newUnit = await this.positionModel.create({ name })
    return newUnit;
  }

  async findAll() {
    return await this.positionModel.find();
  }

  async findOne(id: string) {
    return await this.positionModel.findById(id);
  }

  async update(id: string, updatePositionDto: UpdatePositionDto) {
    return await this.positionModel.findByIdAndUpdate(id, updatePositionDto);
  }

  async remove(id: string) {
    return await this.positionModel.findByIdAndDelete(id);
  }
}
