import { Controller, Post, UploadedFile, UseFilters, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { Public, ResponseMessage } from 'src/configs/custom.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { HttpExceptionFilter } from 'src/configs/http-exception.filter';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Public()
  @Post('upload')
  @ResponseMessage("Tải file thành công")
  @UseInterceptors(FileInterceptor('file'))
  @UseFilters(new HttpExceptionFilter())
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      fileName: file.filename
    }
  }
}
