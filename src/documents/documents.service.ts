import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto, UpdateInfoDocumentDto } from './dto/update-document.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Document, EStatus } from 'src/documents/schemas/document.schema';
import mongoose, { Model } from 'mongoose';
import type { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { join } from 'path';
import { extractInfoFromP12, getRootPath, removeVietnameseTones } from 'src/sign/helpers';
import fs from 'fs'
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { SignAndUpdateDto } from 'src/documents/dto/sign-and-update.dto';
import { P12Signer } from '@signpdf/signer-p12';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import signpdf from '@signpdf/signpdf';
import { Workflow } from 'src/workflows/schemas/workflow.schema';

@Injectable()
export class DocumentsService {
  constructor(@InjectModel(Document.name) private documentModel: Model<Document>,
    @InjectModel(Workflow.name) private workflowModel: Model<Workflow>) { }

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

  async findAllByUnit(page: number, limit: number, qs: string, user: IUser) {
    const { filter, projection, population } = aqp(qs);
    let { sort }: { sort: any } = aqp(qs);

    delete filter.page
    delete filter.limit

    page = page ? page : 1
    limit = limit ? limit : 10
    let skip = (page - 1) * limit

    const totalItems = (await this.documentModel.find({ unit: user.unit })).length
    const totalPages = Math.ceil(totalItems / limit)

    if (!sort) {
      sort = '-updatedAt'
    }

    let workflows = await this.documentModel.find({ unit: user.unit })
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select(projection)
      .select('-steps.order')
      .populate(['unit'], 'name')
      // .populate({ path: 'steps.signers.unit', select: 'name' })
      // .populate({ path: 'steps.signers.position', select: 'name' })
      .exec();

    return {
      meta: {
        current: page,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result: workflows
    }
  }

  async findAll(page: number, limit: number, qs: string, currentUser: IUser) {
    const { filter, projection } = aqp(qs);
    let { sort } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    page = page || 1;
    limit = limit || 10;
    const skip = (page - 1) * limit;

    if (!sort) sort = '-updatedAt' as any;

    /**
     * 1️⃣ LẤY WORKFLOW + STEP MÀ USER ĐƯỢC QUYỀN KÝ
     */
    const workflows = await this.workflowModel
      .find({
        steps: {
          $elemMatch: {
            order: { $gte: 0 }, // để match step bất kỳ, lọc order ở bước sau
            signers: {
              $elemMatch: {
                $and: [
                  currentUser.unit
                    ? { unit: currentUser.unit }
                    : {},
                  currentUser.position
                    ? { position: currentUser.position }
                    : {}
                ]
              }
            }
          }
        }
      })
      .lean();

    /**
     * 2️⃣ MAP workflowId + order hợp lệ
     */
    const workflowStepMap = new Map<string, number[]>();

    workflows.forEach(wf => {
      wf.steps.forEach(step => {
        const matchSigner = step.signers.some(s =>
          (!currentUser.unit || s.unit?.toString() === currentUser.unit.toString()) &&
          (!currentUser.position || s.position?.toString() === currentUser.position.toString())
        );

        if (matchSigner) {
          const key = wf._id.toString();
          if (!workflowStepMap.has(key)) {
            workflowStepMap.set(key, []);
          }
          workflowStepMap.get(key)!.push(step.order);
        }
      });
    });

    /**
     * 3️⃣ BUILD OR CONDITION CHO "ĐẾN LƯỢT KÝ"
     */
    const signingConditions = Array.from(workflowStepMap.entries()).map(
      ([workflowId, orders]) => ({
        workflow: workflowId,
        cur_step: { $in: orders }
      })
    );

    /**
     * 4️⃣ FILTER CHÍNH
     */
    const customFilter = {
      $or: [
        // 1. Văn bản do mình tạo
        { 'author.user': currentUser._id },

        // 2. Đến lượt mình ký
        {
          cur_status: { $in: [EStatus.pending, EStatus.progress] },
          $or: signingConditions
        },

      ]
    };

    const finalFilter =
      filter && Object.keys(filter).length > 0
        ? { $and: [filter, customFilter] }
        : customFilter;

    /**
     * 5️⃣ QUERY DOCUMENT
     */
    const totalItems = await this.documentModel.countDocuments(finalFilter);

    const documents = await this.documentModel
      .find(finalFilter)
      .skip(skip)
      .limit(limit)
      .sort(sort as any)
      .select(projection)
      .populate('author.user author.unit author.position', 'name')
      .populate({
        path: 'workflow',
        select: 'steps'
      })
      .populate({
        path: 'info.signers.user info.signers.unit info.signers.position',
        select: 'name'
      })
      .lean();

    return {
      meta: {
        current: page,
        pageSize: limit,
        pages: Math.ceil(totalItems / limit),
        total: totalItems
      },
      result: documents
    };
  }

  async findAllConfirm(
    page: number,
    limit: number,
    qs: string,
    currentUser: IUser
  ) {
    const { filter, projection } = aqp(qs);
    let { sort } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    page = page || 1;
    limit = limit || 10;
    const skip = (page - 1) * limit;

    if (!sort) sort = '-updatedAt' as any;

    /**
     * FILTER CỐ ĐỊNH
     */
    const customFilter = {
      cur_status: { $in: [EStatus.progress, EStatus.confirmed, EStatus.rejected] },
      'info.signers.user': currentUser._id
    };

    const finalFilter =
      filter && Object.keys(filter).length > 0
        ? { $and: [filter, customFilter] }
        : customFilter;

    /**
     * COUNT
     */
    const totalItems = await this.documentModel.countDocuments(finalFilter);

    /**
     * QUERY
     */
    const documents = await this.documentModel
      .find(finalFilter)
      .skip(skip)
      .limit(limit)
      .sort(sort as any)
      .select(projection)
      .populate('author.user author.unit author.position', 'name')
      .populate({
        path: 'info.signers.user info.signers.unit info.signers.position',
        select: 'name'
      })
      .lean();

    return {
      meta: {
        current: page,
        pageSize: limit,
        pages: Math.ceil(totalItems / limit),
        total: totalItems
      },
      result: documents
    };
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
    // console.log(currentStepIndex, currentStep)

    if (currentStep) {
      const isAuthorized = currentStep.signers.some((s: any) => {

        const matchUnit = !s.unit || s.unit._id.toString() === user.unit?.toString();
        const matchPosition = !s.position || s.position._id.toString() === user.position?.toString();

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
    const newStatus = nextStep >= totalSteps ? 'đã hoàn thành' : 'đang trình ký';
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
          [`info.${document.cur_version}.signers`]: {
            user: user._id,
            unit: user.unit,
            position: user.position,
          }
        }
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

  // Method Reject văn bản
  async rejectDocument(id: string, reason: string, user: IUser) {
    if (!reason || !reason.trim()) {
      throw new BadRequestException('Vui lòng nhập lý do từ chối');
    }

    const document = await this.documentModel.findById(id);
    if (!document) throw new BadRequestException('Không tìm thấy văn bản');

    if (document.cur_status === EStatus.confirmed) {
      throw new BadRequestException('Văn bản đã hoàn thành, không thể từ chối');
    }

    if (document.cur_status === EStatus.rejected) {
      throw new BadRequestException('Văn bản đã bị từ chối trước đó');
    }

    // 2. KHÔNG CHO REJECT NẾU USER ĐÃ KÝ Ở BẤT KỲ BƯỚC NÀO (có tên trong info.signers)
    const hasSigned = document.info.some(infoItem =>
      infoItem.signers.some(signer => signer.user?.toString() === user._id.toString())
    );

    if (hasSigned) {
      throw new BadRequestException('Bạn đã ký văn bản này rồi, không thể từ chối');
    }

    // PUSH USER VÀO SIGNERS NHƯ "ĐÃ KÝ" (nhưng reject)
    const rejectSigner = {
      user: user._id,
      unit: user.unit,
      position: user.position,
    };

    // Cập nhật version hiện tại: ghi lý do reject vào error
    const result = await this.documentModel.findByIdAndUpdate(
      id,
      {
        $set: {
          cur_status: EStatus.rejected,
          [`info.${document.cur_version}.error`]: reason.trim(),
        },
        $push: {
          [`info.${document.cur_version}.signers`]: rejectSigner // push user vào signers version hiện tại
        }
      },
      { new: true }
    );

    return { message: 'Từ chối văn bản thành công', data: result };
  }

  // Method Tạo version mới (giữ nguyên document, chỉ push vào info)
  async createNewVersion(id: string, newLink: string, user: IUser) {
    if (!newLink) {
      throw new BadRequestException('Vui lòng upload file PDF mới');
    }

    const document = await this.documentModel.findById(id);
    if (!document) throw new BadRequestException('Không tìm thấy văn bản cũ');

    if (document.cur_status !== EStatus.rejected) {
      throw new BadRequestException('Chỉ được tạo version mới khi văn bản bị từ chối');
    }

    const newVersion = document.cur_version + 1;

    // Cập nhật document hiện tại: push version mới vào info + reset các field
    const updatedDoc = await this.documentModel.findByIdAndUpdate(
      id,
      {
        $set: {
          cur_version: newVersion,
          cur_link: newLink,
          cur_step: 0,
          cur_status: EStatus.pending, // 'vừa tải lên'
        },
        $push: {
          info: {
            version: newVersion,
            link: newLink,
            signers: []
          }
        }
      },
      { new: true } // trả về document sau update
    );

    return updatedDoc;
  }

}
