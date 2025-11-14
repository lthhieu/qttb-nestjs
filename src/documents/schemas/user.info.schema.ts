import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Unit } from 'src/units/schemas/unit.schema';
import { Position } from 'src/positions/schemas/position.schema';
import { User } from 'src/users/schemas/user.schema';

@Schema({ _id: false })
export class UserInfo {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    user: User | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Unit.name })
    unit: Unit | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Position.name })
    position: Position | null;
}
export const UserInfoSchema = SchemaFactory.createForClass(UserInfo);


