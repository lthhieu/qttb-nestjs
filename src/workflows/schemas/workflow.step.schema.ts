import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Unit } from 'src/units/schemas/unit.schema';
import { Position } from 'src/positions/schemas/position.schema';

@Schema({ _id: false })
export class WorkflowSigner {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Unit.name })
    unit: Unit | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Position.name })
    position: Position | null;
}
export const WorkflowSignerSchema = SchemaFactory.createForClass(WorkflowSigner);


@Schema({ _id: false }) // không tạo _id riêng cho mỗi step
export class WorkflowStep {
    @Prop()
    order: number;

    // Mỗi bước có thể có nhiều người ký (OR logic)
    @Prop({ type: [WorkflowSignerSchema], default: [] })
    signers: WorkflowSigner[];
}
export const WorkflowStepSchema = SchemaFactory.createForClass(WorkflowStep);

