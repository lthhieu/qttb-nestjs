import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Document, DocumentSchema } from 'src/documents/schemas/document.schema';
import { Workflow, WorkflowSchema } from 'src/workflows/schemas/workflow.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Document.name, schema: DocumentSchema }]),
    MongooseModule.forFeature([{ name: Workflow.name, schema: WorkflowSchema }])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule { }
