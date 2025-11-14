import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentDto } from './create-document.dto';
import { IsNotEmpty } from 'class-validator';

// export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}

export class UpdateDocumentDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;
}
