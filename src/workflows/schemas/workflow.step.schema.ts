import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Unit } from 'src/units/schemas/unit.schema';
import { Position } from 'src/positions/schemas/position.schema';

@Schema({ _id: false }) // không tạo _id riêng cho mỗi step
export class WorkflowStep {
    @Prop()
    order: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Unit.name })
    unit: Unit | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Unit.name })
    position: Position | null;
}
