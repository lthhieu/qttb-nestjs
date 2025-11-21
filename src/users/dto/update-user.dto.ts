import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsMongoId, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    role: string;
    @IsOptional()
    p12: string;
    @IsOptional()
    @IsMongoId({ message: 'Mã đơn vị không đúng định dạng' })
    unit: string;
    @IsOptional()
    @IsMongoId({ message: 'Mã vị trí không đúng định dạng' })
    position: string;
}
