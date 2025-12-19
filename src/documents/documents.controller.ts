import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto, UpdateInfoDocumentDto } from './dto/update-document.dto';
import { ResponseMessage, User } from 'src/configs/custom.decorator';
import type { IUser } from 'src/users/users.interface';
import { SignAndUpdateDto } from 'src/documents/dto/sign-and-update.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Post()
  @ResponseMessage('Tạo tài liệu thành công')
  create(@Body() createDocumentDto: CreateDocumentDto, @User() user: IUser) {
    return this.documentsService.create(createDocumentDto, user);
  }

  @Get('by-unit')
  @ResponseMessage('Tải quy trình thành công')
  findAllByUnit(@Query('page') page: string, @Query('limit') limit: string, @Query() qs: string, @User() user: IUser) {
    return this.documentsService.findAllByUnit(+page, +limit, qs, user);
  }

  @Get()
  @ResponseMessage('Tải dữ liệu tài liệu thành công')
  findAll(@Query('page') page: string, @Query('limit') limit: string, @Query() qs: string, @User() user: IUser) {
    return this.documentsService.findAll(+page, +limit, qs, user);
  }

  @Get('all-confirm')
  @ResponseMessage('Tải dữ liệu tài liệu thành công')
  findAllConfirm(@Query('page') page: string, @Query('limit') limit: string, @Query() qs: string, @User() user: IUser) {
    return this.documentsService.findAllConfirm(+page, +limit, qs, user);
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

  @Patch('update-info/:id')
  @ResponseMessage('Cập nhật tài liệu thành công')
  updateInfo(@Param('id') id: string, @Body() updateInfoDocumentDto: UpdateInfoDocumentDto, @User() user: IUser) {
    return this.documentsService.updateInfo(id, updateInfoDocumentDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Xóa tài liệu thành công")
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }

  @Patch('test-update-info/:id')
  @ResponseMessage('Ký số và cập nhật quy trình thành công!')
  async signAndUpdateInfo(
    @Param('id') id: string,
    @Body() dto: SignAndUpdateDto,  // CHỈ 1 BODY DUY NHẤT
    @User() user: IUser,
  ) {
    return this.documentsService.signAndUpdateInfo(id, dto, user);
  }
}
