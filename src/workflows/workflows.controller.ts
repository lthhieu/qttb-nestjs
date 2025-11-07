import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { ResponseMessage, User } from 'src/configs/custom.decorator';
import type { IUser } from 'src/users/users.interface';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) { }

  @Post()
  @ResponseMessage('Tạo quy trình thành công')
  create(@Body() createWorkflowDto: CreateWorkflowDto, @User() user: IUser) {
    return this.workflowsService.create(createWorkflowDto, user);
  }

  @Get()
  @ResponseMessage('Tải quy trình thành công')
  findAll() {
    return this.workflowsService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Tải quy trình thành công')
  findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật quy trình thành công')
  update(@Param('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto) {
    return this.workflowsService.update(id, updateWorkflowDto);
  }

  @Delete(':id')
  @ResponseMessage('Xóa quy trình thành công')
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }
}
