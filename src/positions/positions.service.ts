import { Injectable } from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Position } from 'src/positions/schemas/position.schema';
import { Model } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PositionsService {

  constructor(@InjectModel(Position.name) private positionModel: Model<Position>,) { }

  async create(createPositionDto: CreatePositionDto) {
    const { name } = createPositionDto
    let newUnit = await this.positionModel.create({ name })
    return newUnit;
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, projection, population } = aqp(qs);
    let { sort }: { sort: any } = aqp(qs);

    delete filter.page
    delete filter.limit

    page = page ? page : 1
    limit = limit ? limit : 100
    let skip = (page - 1) * limit

    const totalItems = (await this.positionModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / limit)

    if (!sort) {
      sort = '-updatedAt'
    }

    let positions = await this.positionModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select(projection)
      // .populate(['unit', 'position'], 'name -_id')
      .exec();

    return {
      meta: {
        current: page,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result: positions
    }
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
