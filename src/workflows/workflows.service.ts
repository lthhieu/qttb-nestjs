import { Injectable } from '@nestjs/common';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Workflow } from './schemas/workflow.schema';
import { Model } from 'mongoose';

@Injectable()
export class WorkflowsService {

  constructor(@InjectModel(Workflow.name) private workflowModel: Model<Workflow>,) { }

  async create(createWorkflowDto: CreateWorkflowDto, user: IUser) {
    const { name, version, steps } = createWorkflowDto;
    const unit = user.unit;
    let newWorkflow = await this.workflowModel.create({ name, version, steps, unit });
    return newWorkflow;
  }

  async findAll() {
    return await this.workflowModel.find()
      .populate('unit', 'name -_id');
  }

  async findOne(id: string) {
    return await this.workflowModel.findById(id)
      .populate('unit', 'name -_id');
  }

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto) {
    return await this.workflowModel.findByIdAndUpdate(id, updateWorkflowDto);
  }

  async remove(id: string) {
    return await this.workflowModel.findByIdAndDelete(id);
  }
}
