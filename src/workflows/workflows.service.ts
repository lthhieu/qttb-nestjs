import { Injectable } from '@nestjs/common';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Workflow } from './schemas/workflow.schema';
import { Model } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class WorkflowsService {

  constructor(@InjectModel(Workflow.name) private workflowModel: Model<Workflow>,) { }

  async create(createWorkflowDto: CreateWorkflowDto, user: IUser) {
    const { name, version, steps } = createWorkflowDto;
    const unit = user.unit;
    let newWorkflow = await this.workflowModel.create({ name, version, steps, unit });
    return newWorkflow;
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, projection, population } = aqp(qs);
    let { sort }: { sort: any } = aqp(qs);

    delete filter.page
    delete filter.limit

    page = page ? page : 1
    limit = limit ? limit : 10
    let skip = (page - 1) * limit

    const totalItems = (await this.workflowModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / limit)

    if (!sort) {
      sort = '-updatedAt'
    }

    let workflows = await this.workflowModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select(projection)
      .select('-steps.order')
      .populate(['unit'], 'name')
      // .populate({ path: 'steps.signers.unit', select: 'name' })
      // .populate({ path: 'steps.signers.position', select: 'name' })
      .exec();

    return {
      meta: {
        current: page,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result: workflows
    }
    // return await this.workflowModel.find()
    //   .populate(['unit'], 'name -_id')
    //   .populate({ path: 'steps.signers.unit', select: 'name -_id' })
    //   .populate({ path: 'steps.signers.position', select: 'name -_id' });
  }

  async findAllByUnit(page: number, limit: number, qs: string, user: IUser) {
    // let workflows = await this.workflowModel.find({ unit: user.unit }).populate(['unit'], 'name')
    const { filter, projection, population } = aqp(qs);
    let { sort }: { sort: any } = aqp(qs);

    delete filter.page
    delete filter.limit

    page = page ? page : 1
    limit = limit ? limit : 10
    let skip = (page - 1) * limit

    const totalItems = (await this.workflowModel.find({ unit: user.unit })).length
    const totalPages = Math.ceil(totalItems / limit)

    if (!sort) {
      sort = '-updatedAt'
    }

    let workflows = await this.workflowModel.find({ unit: user.unit })
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select(projection)
      .select('-steps.order')
      .populate(['unit'], 'name')
      // .populate({ path: 'steps.signers.unit', select: 'name' })
      // .populate({ path: 'steps.signers.position', select: 'name' })
      .exec();

    return {
      meta: {
        current: page,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result: workflows
    }
  }

  async findOne(id: string) {
    return await this.workflowModel.findById(id)
      .populate('unit', 'name');
  }

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto) {
    return await this.workflowModel.findByIdAndUpdate(id, updateWorkflowDto);
  }

  async remove(id: string) {
    return await this.workflowModel.findByIdAndDelete(id);
  }
}
