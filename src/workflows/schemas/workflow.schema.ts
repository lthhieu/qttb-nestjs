import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Unit } from 'src/units/schemas/unit.schema';
import { WorkflowStep, WorkflowStepSchema } from './workflow.step.schema';

export type WorkflowDocument = HydratedDocument<Workflow>;
@Schema({ timestamps: true })
export class Workflow {

    @Prop()
    name: string;

    @Prop()
    version: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Unit.name })
    unit?: Unit | null;

    @Prop({ type: [WorkflowStepSchema], default: [] })
    steps: WorkflowStep[];

}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);