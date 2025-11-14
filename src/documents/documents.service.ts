import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Document } from 'src/documents/schemas/document.schema';
import mongoose, { Model } from 'mongoose';
import type { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class DocumentsService {
  constructor(@InjectModel(Document.name) private documentModel: Model<Document>,) { }

  async create(createDocumentDto: CreateDocumentDto, user: IUser) {
    const { name, workflow, link } = createDocumentDto

    const data = {
      name,
      cur_link: link,
      author: {
        user: user._id, unit: user?.unit ?? null, position: user?.position ?? null
      },
      workflow,
      info: [{
        version: 0,
        link,
        signers: []
      }]
    }
    let newDocument = await this.documentModel.create(data)
    return newDocument;
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, projection, population } = aqp(qs);
    let { sort }: { sort: any } = aqp(qs);

    delete filter.page
    delete filter.limit

    page = page ? page : 1
    limit = limit ? limit : 10
    let skip = (page - 1) * limit

    const totalItems = (await this.documentModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / limit)

    if (!sort) {
      sort = '-updatedAt'
    }

    let documents = await this.documentModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select(projection)
      // .populate(['workflow'], 'name')
      .populate(['author.user'], 'name')
      .populate(['author.unit'], 'name')
      .populate(['author.position'], 'name')
      .exec();

    return {
      meta: {
        current: page,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result: documents
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ')
    }
    const document = await this.documentModel.findOne({ _id: id })
      // .populate(['workflow'], 'name')
      .populate(['author.user'], 'name')
      .populate(['author.unit'], 'name')
      .populate(['author.position'], 'name')
    if (!document) {
      throw new BadRequestException('Không tìm thấy thông tin tài liệu')
    }
    return document
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ')
    }
    return await this.documentModel.updateOne({ _id: id }, updateDocumentDto)
  }

  async remove(id: string) {
    return await this.documentModel.findByIdAndDelete(id);
  }
}
