import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { ResponseMessage } from 'src/configs/custom.decorator';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) { }

  @Post()
  @ResponseMessage('Tạo vị trí thành công')
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  @ResponseMessage('Tải thông tin vị trí thành công')
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Tải thông tin vị trí thành công')
  findOne(@Param('id') id: string) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật thông tin vị trí thành công')
  update(@Param('id') id: string, @Body() updatePositionDto: UpdatePositionDto) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Delete(':id')
  @ResponseMessage('Xóa vị trí thành công')
  remove(@Param('id') id: string) {
    return this.positionsService.remove(id);
  }
}
