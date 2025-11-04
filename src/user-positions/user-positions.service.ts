import { Injectable } from '@nestjs/common';
import { CreateUserPositionDto } from './dto/create-user-position.dto';
import { UpdateUserPositionDto } from './dto/update-user-position.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserPosition } from 'src/user-positions/schemas/user-position.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserPositionsService {
  constructor(@InjectModel(UserPosition.name) private userPositionModel: Model<UserPosition>,) { }

  async create(createUserPositionDto: CreateUserPositionDto) {
    let newUserPosition = await this.userPositionModel.create(createUserPositionDto);
    return newUserPosition;
  }

  findAll() {
    return `This action returns all userPositions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userPosition`;
  }

  update(id: number, updateUserPositionDto: UpdateUserPositionDto) {
    return `This action updates a #${id} userPosition`;
  }

  remove(id: number) {
    return `This action removes a #${id} userPosition`;
  }
}
