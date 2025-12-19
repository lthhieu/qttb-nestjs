import { Injectable } from '@nestjs/common';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Unit } from 'src/units/schemas/unit.schema';
import { Model } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class UnitsService {
  constructor(@InjectModel(Unit.name) private unitModel: Model<Unit>,) { }

  async create(createUnitDto: CreateUnitDto) {
    const { name } = createUnitDto
    let newUnit = await this.unitModel.create({ name })
    return newUnit;
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, projection, population } = aqp(qs);
    let { sort }: { sort: any } = aqp(qs);

    delete filter.page
    delete filter.limit

    page = page ? page : 1
    limit = limit ? limit : 10
    let skip = (page - 1) * limit

    const totalItems = (await this.unitModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / limit)

    if (!sort) {
      sort = '-updatedAt'
    }

    let units = await this.unitModel.find(filter)
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
      result: units
    }
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
