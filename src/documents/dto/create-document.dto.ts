import { Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";

class UserInfoDto {
    @IsOptional()
    @IsMongoId({ message: 'Mã người dùng không hợp lệ' })
    user: string | null;
    @IsOptional()
    @IsMongoId({ message: 'Mã đơn vị không hợp lệ' })
    unit: string | null;
    @IsOptional()
    @IsMongoId({ message: 'Mã chức vụ không hợp lệ' })
    position: string | null;
}

class InfoDto {
    @IsNotEmpty({ message: 'Phiên bản không được để trống' })
    version: number;

    @IsNotEmpty({ message: 'Link không được để trống' })
    link: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => UserInfoDto)
    signers: UserInfoDto[];
}

export class CreateDocumentDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;

    @IsNotEmpty({ message: 'Mã quy trình không được để trống' })
    @IsMongoId({ message: 'Mã quy trình không hợp lệ' })
    workflow: string | null;

    @IsNotEmpty({ message: 'Link không được để trống' })
    link: string;

    @ValidateNested({ each: true })
    @Type(() => InfoDto)
    info: InfoDto[];
}
