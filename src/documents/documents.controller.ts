import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ResponseMessage, User } from 'src/configs/custom.decorator';
import type { IUser } from 'src/users/users.interface';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Post()
  @ResponseMessage('Tạo tài liệu thành công')
  create(@Body() createDocumentDto: CreateDocumentDto, @User() user: IUser) {
    return this.documentsService.create(createDocumentDto, user);
  }

  @Get()
  @ResponseMessage('Tải dữ liệu tài liệu thành công')
  findAll(@Query('page') page: string, @Query('limit') limit: string, @Query() qs: string) {
    return this.documentsService.findAll(+page, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Tải dữ liệu tài liệu thành công')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật tài liệu thành công')
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @ResponseMessage("Xóa tài liệu thành công")
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
