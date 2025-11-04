import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
    @Prop()
    title: string;

    @Prop()
    content: string;

    @Prop({ unique: true, lowercase: true })
    slug: string;

    @Prop()
    thumbnail: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
