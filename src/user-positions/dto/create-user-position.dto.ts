import { IsDateString, IsMongoId, IsNotEmpty } from "class-validator";

export class CreateUserPositionDto {
    @IsNotEmpty({ message: 'UserID không được để trống' })
    @IsMongoId({ message: 'UserID không hợp lệ' })
    user: string;

    @IsNotEmpty({ message: 'PositionID không được để trống' })
    @IsMongoId({ message: 'PositionID không hợp lệ' })
    position: string;

    @IsNotEmpty({ message: 'startDate không được để trống' })
    @IsDateString({}, { message: 'startDate phải là định dạng ngày hợp lệ' })
    startDate: string;
}
