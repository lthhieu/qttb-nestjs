import { Controller, Post, Req, Res, UploadedFile, UseFilters, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { Public, ResponseMessage } from 'src/configs/custom.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { HttpExceptionFilter } from 'src/configs/http-exception.filter';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService,
    private configService: ConfigService
  ) { }

  @Public()
  @Post('upload')
  @ResponseMessage("Tải file thành công")
  @UseInterceptors(FileInterceptor('file'))
  @UseFilters(new HttpExceptionFilter())
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request ) {
    return {
      filename: file.filename,
      folder: req.headers['folder_type'] ?? "default",
      link: `${this.configService.get<number>('FRONTEND_URI')}/files?folder=${req.headers['folder_type'] ?? "default"}&name=${file.filename}`
    }
  }
}
