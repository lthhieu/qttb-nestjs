import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create-document.dto';
import { IsNotEmpty } from 'class-validator';
import { DocumentInfo } from 'src/documents/schemas/document.info.schema';
import { UserInfo } from 'src/documents/schemas/user.info.schema';

// export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}

export class UpdateDocumentDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;
}

export class UpdateInfoDocumentDto {
    @IsNotEmpty({ message: 'Phiên bản không được để trống' })
    cur_version: number;
    @IsNotEmpty({ message: 'Đường dẫn không được để trống' })
    cur_link: string;
    @IsNotEmpty({ message: 'Trạng thái không được để trống' })
    cur_status: string;
    @IsNotEmpty({ message: 'Bước không được để trống' })
    cur_step: number;
}

export class RejectDocumentDto {
    @IsNotEmpty({ message: 'Lý do không được để trống' })
    reason: string;
}
