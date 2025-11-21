import { Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";

export class SignDocumentDto {
    @IsNotEmpty({ message: 'Tên file p12 không được để trống' })
    p12_filename: string;
    @IsNotEmpty({ message: 'Tên file document không được để trống' })
    document_filename: string;
    @IsNotEmpty({ message: 'Mật khẩu file p12 không được để trống' })
    password: string;
    // @IsNotEmpty({ message: 'Mã quy trình không được để trống' })
    // @IsMongoId({ message: 'Mã quy trình không hợp lệ' })
    // workflow: string | null;
    @IsNotEmpty({ message: 'Tọa độ X không được để trống' })
    SIGN_X: number;
    @IsNotEmpty({ message: 'Tọa độ Y không được để trống' })
    SIGN_Y: number;
    @IsNotEmpty({ message: 'Trang muốn ký không được để trống' })
    page: number;
    @IsNotEmpty({ message: 'Chiều dài vùng ký không được để trống' })
    SIGN_HEIGHT: number;
    @IsNotEmpty({ message: 'Chiều rộng vùng ký không được để trống' })
    SIGN_WIDTH: number;

}
