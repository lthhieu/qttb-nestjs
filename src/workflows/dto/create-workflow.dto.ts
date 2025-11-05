import { IsMongoId, IsNotEmpty } from "class-validator";

export class CreateWorkflowDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;
    @IsNotEmpty({ message: 'Phiên bản không được để trống' })
    version: number;
    @IsNotEmpty({ message: 'Mã đơn vị không được để trống' })
    @IsMongoId({ message: 'Mã đơn vị không hợp lệ' })
    unit: string;

}
