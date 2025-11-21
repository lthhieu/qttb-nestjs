import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Position } from 'src/positions/schemas/position.schema';
import { Unit } from 'src/units/schemas/unit.schema';

export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true })
export class User {

    @Prop()
    name: string;

    @Prop()
    email: string;

    @Prop()
    password: string;

    @Prop()
    image: string;

    @Prop({ default: 'USER' })
    role: string;

    @Prop()
    refreshToken: string;

    @Prop()
    p12: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Unit.name })
    unit: Unit | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Position.name })
    position: Position | null;

}

export const UserSchema = SchemaFactory.createForClass(User);