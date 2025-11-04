import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Position } from 'src/positions/schemas/position.schema';
import { Unit } from 'src/units/schemas/unit.schema';
import { User } from 'src/users/schemas/user.schema';

export type UserPositionDocument = HydratedDocument<UserPosition>;
@Schema({ timestamps: true })
export class UserPosition {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    user: User;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Position.name })
    position: Position;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Unit.name })
    unit?: Unit | null;

    @Prop()
    startDate: Date;

    @Prop({ type: Date, default: null })
    endDate?: Date | null;
}
export const UserPositionSchema = SchemaFactory.createForClass(UserPosition);