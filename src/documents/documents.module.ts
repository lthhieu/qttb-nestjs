import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Document, DocumentSchema } from 'src/documents/schemas/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Document.name, schema: DocumentSchema }])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule { }
