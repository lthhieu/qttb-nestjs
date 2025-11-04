import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Public, ResponseMessage } from 'src/configs/custom.decorator';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) { }

  @Post()
  @ResponseMessage('Tạo đơn vị thành công')
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitsService.create(createUnitDto);
  }

  @Get()
  @ResponseMessage('Tải thông tin đơn vị thành công')
  findAll() {
    return this.unitsService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Tải thông tin đơn vị thành công')
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật thông tin đơn vị thành công')
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @Delete(':id')
  @ResponseMessage('Xóa đơn vị thành công')
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }
}
