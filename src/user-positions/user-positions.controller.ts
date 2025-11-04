import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserPositionsService } from './user-positions.service';
import { CreateUserPositionDto } from './dto/create-user-position.dto';
import { UpdateUserPositionDto } from './dto/update-user-position.dto';
import { ResponseMessage } from 'src/configs/custom.decorator';

@Controller('user-positions')
export class UserPositionsController {
  constructor(private readonly userPositionsService: UserPositionsService) { }

  @Post()
  @ResponseMessage('Thêm vị trí chức vụ thành công')
  create(@Body() createUserPositionDto: CreateUserPositionDto) {
    return this.userPositionsService.create(createUserPositionDto);
  }

  @Get()
  findAll() {
    return this.userPositionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userPositionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserPositionDto: UpdateUserPositionDto) {
    return this.userPositionsService.update(+id, updateUserPositionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userPositionsService.remove(+id);
  }
}
