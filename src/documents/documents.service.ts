import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto, UpdateInfoDocumentDto } from './dto/update-document.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Document } from 'src/documents/schemas/document.schema';
import mongoose, { Model } from 'mongoose';
import type { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { SignDocumentDto } from 'src/sign/dto/sign.document.dto';
import { join } from 'path';
import { extractInfoFromP12, getRootPath, removeVietnameseTones } from 'src/sign/helpers';
import fs from 'fs'
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { SignAndUpdateDto } from 'src/documents/dto/sign-and-update.dto';
import { P12Signer } from '@signpdf/signer-p12';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import signpdf from '@signpdf/signpdf';

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
      .populate(['author.user'], 'name')
      .populate(['author.unit'], 'name')
      .populate(['author.position'], 'name')
      .populate({
        path: 'workflow',
        select: 'steps',
        populate: {
          path: 'steps.signers.unit steps.signers.position',
          select: 'name'
        }
      })
      .populate({
        path: 'info',
        select: 'signers',
        populate: {
          path: 'signers.unit signers.user signers.position',
          select: 'name'
        }
      })
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
      .populate({
        path: 'workflow',
        select: 'steps',
        populate: {
          path: 'steps.signers.unit steps.signers.position',
          select: 'name'
        }
      })
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

  async updateInfo(id: string, updateInfoDocumentDto: UpdateInfoDocumentDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ')
    }
    const { cur_link, cur_status, cur_step, cur_version } = updateInfoDocumentDto
    // return 'ok';
    return await this.documentModel.updateOne(
      { _id: id },
      {
        $set: {
          cur_link,
          cur_status,
          cur_step,
          cur_version
        },
        $push: {
          'info.$[i].signers': {
            user: user._id,
            position: user.position,
            unit: user.unit
          }
        }
      },
      {
        arrayFilters: [
          { 'i.version': cur_version }
        ]
      }
    )

  }

  async remove(id: string) {
    return await this.documentModel.findByIdAndDelete(id);
  }

  async signAndUpdateInfo(id: string, dto: SignAndUpdateDto, user: IUser) {
    const {
      password,
      p12_filename,
      document_filename,
      SIGN_X,
      SIGN_Y,
      SIGN_WIDTH = 250,
      SIGN_HEIGHT = 80,
      page = 0,
      cur_link,
      cur_version,
    } = dto;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID tài liệu không hợp lệ');
    }

    // 1. Tìm document + populate workflow
    const document = await this.documentModel
      .findById(id)
      .populate({
        path: 'workflow',
        populate: {
          path: 'steps.signers.unit steps.signers.position',
          select: 'name',
        },
      })
      .exec();

    if (!document) throw new BadRequestException('Không tìm thấy tài liệu');

    // 2. KIỂM TRA QUYỀN KÝ
    const currentStepIndex = document.cur_step || 0;
    const currentStep = (document.workflow as any)?.steps?.[currentStepIndex];

    if (currentStep) {
      const isAuthorized = currentStep.signers.some((s: any) => {
        const matchUnit = !s.unit || s.unit.toString() === user.unit?.toString();
        const matchPosition = !s.position || s.position.toString() === user.position?.toString();
        return matchUnit && matchPosition;
      });

      if (!isAuthorized) {
        throw new ForbiddenException('Bạn không có quyền ký ở bước này');
      }
    }

    // 3. KÝ PDF – ĐÃ SỬA TẤT CẢ LỖI NHỎ
    const pdfPath = join(getRootPath(), `public/files/documents/${document_filename}`);
    const outputPath = join(getRootPath(), `public/files/documents/${document_filename}`);
    const p12Path = join(getRootPath(), `public/files/certs/${p12_filename}`);

    if (!fs.existsSync(pdfPath)) throw new Error('Không tìm thấy file PDF');
    if (!fs.existsSync(p12Path)) throw new Error('Không tìm thấy file P12');

    const pdfBuffer = fs.readFileSync(pdfPath);
    const p12Buffer = fs.readFileSync(p12Path);

    const certInfo = extractInfoFromP12(p12Buffer, password);

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.registerFontkit(fontkit);

    const fontPath = join(getRootPath(), 'public/fonts/TIMES.TTF');
    if (!fs.existsSync(fontPath)) throw new Error('Không tìm thấy font TIMES.TTF');
    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });

    const pages = pdfDoc.getPages();
    const pageToSign = pages[page];

    // Vẽ khung
    pageToSign.drawRectangle({
      x: SIGN_X,
      y: SIGN_Y,
      width: SIGN_WIDTH,
      height: SIGN_HEIGHT,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Vẽ chữ
    const dateStr = new Date().toISOString().split('T')[0];
    const text = `Ký số bởi: ${certInfo.commonName}\nEmail: ${certInfo.email}\nĐơn vị: ${certInfo.organization}\nNgày: ${dateStr}`;

    pageToSign.drawText(text, {
      x: SIGN_X + 5,
      y: SIGN_Y + 55,
      size: 10,
      font: customFont,
      color: rgb(0, 0, 0),
      lineHeight: 12,
    });

    // Tạo placeholder – SỬA ĐÚNG: widgetRect phải là mảng [x, y, x+width, y+height]
    pdflibAddPlaceholder({
      pdfDoc,
      pdfPage: pageToSign,
      reason: 'Digital Signature',
      contactInfo: certInfo.email || 'noreply@example.com',
      name: removeVietnameseTones(certInfo.commonName),
      location: 'Viet Nam',
      widgetRect: [SIGN_X, SIGN_Y, SIGN_X + SIGN_WIDTH, SIGN_Y + SIGN_HEIGHT], // ← SỬA ĐÚNG
    });

    const pdfWithPlaceholder = Buffer.from(await pdfDoc.save({ useObjectStreams: false }));

    // ← SỬA ĐÚNG: signpdf.sign (không phải signPdf.sign)
    const signer = new P12Signer(p12Buffer, { passphrase: password });
    const signedPdf = await signpdf.sign(pdfWithPlaceholder, signer);

    // Ghi đè file
    fs.writeFileSync(outputPath, signedPdf);

    // 4. CẬP NHẬT WORKFLOW
    const totalSteps = (document.workflow as any)?.steps?.length || 0;
    const nextStep = currentStepIndex + 1;
    const newStatus = nextStep >= totalSteps ? 'confirmed' : 'progress';
    const newVersion = (document.cur_version || 0);

    // Sửa lỗi updateOne – thêm arrayFilters nếu cần
    await this.documentModel.updateOne(
      { _id: id },
      {
        $set: {
          cur_link: cur_link || document.cur_link,
          cur_step: nextStep,
          cur_status: newStatus,
          cur_version: newVersion,
        } as any,
        $push: {
          info: {
            version: newVersion,
            link: cur_link || document.cur_link,
            signers: [
              {
                user: user._id,
                unit: user.unit,
                position: user.position,
              },
            ],
          },
        },
      },
    );

    return {
      message: 'Ký số thành công và quy trình đã được cập nhật!',
      data: {
        documentId: id,
        version: newVersion,
        step: nextStep,
        status: newStatus,
      },
    };
  }

}
