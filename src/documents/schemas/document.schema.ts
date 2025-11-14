import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { DocumentInfo, DocumentInfoSchema } from 'src/documents/schemas/document.info.schema';
import { UserInfo, UserInfoSchema } from 'src/documents/schemas/user.info.schema';
import { Workflow } from 'src/workflows/schemas/workflow.schema';

export enum EStatus {
    pending = 'pending',
    progress = 'progress',
    confirmed = 'confirmed',
    rejected = 'rejected'
}

export type DocumentDocument = HydratedDocument<Document>;
@Schema({ timestamps: true })
export class Document {
    @Prop()
    name: string;

    @Prop({ type: UserInfoSchema })
    author: UserInfo;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Workflow.name })
    workflow: Workflow | null;

    @Prop({ default: 0 })
    cur_version: number;

    @Prop()
    cur_link: string;

    @Prop({ type: String, enum: EStatus, default: EStatus.pending })
    cur_status: EStatus;

    @Prop({ type: [DocumentInfoSchema], default: [] })
    info: DocumentInfo[]
}
export const DocumentSchema = SchemaFactory.createForClass(Document);