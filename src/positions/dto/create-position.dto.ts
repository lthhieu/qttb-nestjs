import { IsNotEmpty } from "class-validator";

export class CreatePositionDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;
}
