import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from 'src/roles/schemas/role.schema';
import { Model } from 'mongoose';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>,) { }

  async create(createUnitDto: CreateRoleDto) {
    const { name } = createUnitDto
    let newUnit = await this.roleModel.create({ name })
    return newUnit;
  }

  async findAll() {
    return await this.roleModel.find();
  }

  async findOne(id: string) {
    return await this.roleModel.findById(id);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    return await this.roleModel.findByIdAndUpdate(id, updateRoleDto);
  }

  async remove(id: string) {
    return await this.roleModel.findByIdAndDelete(id);
  }
}
