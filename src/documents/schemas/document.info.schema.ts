import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UserInfo } from "src/documents/schemas/user.info.schema";

@Schema({ _id: false })
export class DocumentInfo {
    @Prop()
    version: number;

    @Prop()
    link: string;

    @Prop()
    error?: string;

    @Prop({ type: [UserInfo], default: [] })
    signers: UserInfo[];
}
export const DocumentInfoSchema = SchemaFactory.createForClass(DocumentInfo);