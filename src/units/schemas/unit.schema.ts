import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UnitDocument = HydratedDocument<Unit>;
@Schema({ timestamps: true })
export class Unit {
    @Prop()
    name: string;
}
export const UnitSchema = SchemaFactory.createForClass(Unit);