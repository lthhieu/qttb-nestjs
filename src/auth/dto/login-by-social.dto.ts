import { IsNotEmpty, IsOptional } from "class-validator";

export class LoginBySocial {
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;
    @IsNotEmpty({ message: 'Ảnh đại diện không được để trống' })
    @IsOptional()
    image: string;
    @IsOptional()
    position: string;
    @IsOptional()
    unit: string;
    @IsOptional()
    role: string;
    @IsOptional()
    p12: string;
}