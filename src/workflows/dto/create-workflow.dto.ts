import { Transform, Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsOptional, ValidateNested } from "class-validator";
import { WorkflowStep } from "../schemas/workflow.step.schema";

class WorkflowSignerDto {
    @IsOptional()
    @IsMongoId({ message: 'Mã đơn vị không hợp lệ' })
    unit: string | null;
    @IsOptional()
    @IsMongoId({ message: 'Mã chức vụ không hợp lệ' })
    position: string | null;
}

class WorkflowStepDto {
    @IsNotEmpty({ message: 'Thứ tự không được để trống' })
    order: number;
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => WorkflowSignerDto)
    signers: WorkflowSignerDto[];
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

}
