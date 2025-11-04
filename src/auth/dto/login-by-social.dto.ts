import { IsNotEmpty } from "class-validator";

export class LoginBySocial {
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;
    @IsNotEmpty({ message: 'Ảnh đại diện không được để trống' })
    image: string;
}