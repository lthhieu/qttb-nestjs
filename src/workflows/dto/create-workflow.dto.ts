import { Transform, Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { WorkflowStep } from "../schemas/workflow.step.schema";

class WorkflowStepDto {
    @IsNotEmpty({ message: 'Thứ tự không được để trống' })
    order: number;
    @IsOptional()
    @IsMongoId({ message: 'Mã đơn vị không hợp lệ' })
    unit: string | null;
    @IsOptional()
    @IsMongoId({ message: 'Mã chức vụ không hợp lệ' })
    position: string | null;
}

export class CreateWorkflowDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;
    @IsNotEmpty({ message: 'Phiên bản không được để trống' })
    version: number;
    @IsOptional()
    @Transform(({ value }) => value ?? [])
    @ValidateNested({ each: true })
    @Type(() => WorkflowStepDto)
    steps: WorkflowStep[] = [];
    // @IsNotEmpty({ message: 'Mã đơn vị không được để trống' })
    // @IsMongoId({ message: 'Mã đơn vị không hợp lệ' })
    //  unit: string;

}
