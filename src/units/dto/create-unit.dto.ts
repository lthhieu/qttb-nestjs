import { IsNotEmpty } from "class-validator";

export class CreateUnitDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;
}
