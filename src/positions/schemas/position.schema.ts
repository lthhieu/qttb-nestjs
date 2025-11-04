import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PositionDocument = HydratedDocument<Position>;
@Schema({ timestamps: true })
export class Position {
    @Prop()
    name: string;
}
export const PositionSchema = SchemaFactory.createForClass(Position);