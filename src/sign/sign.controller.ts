import { BadRequestException, Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { SignService } from './sign.service';
import { ResponseMessage, User } from 'src/configs/custom.decorator';
import { extractInfoFromP12, getRootPath, removeVietnameseTones } from 'src/sign/helpers';
import path, { join } from "path";
import fs from 'fs';
import { PDFDocument, rgb } from 'pdf-lib'; // Bỏ StandardFonts
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { P12Signer } from '@signpdf/signer-p12';
import signpdf from '@signpdf/signpdf';
import fontkit from '@pdf-lib/fontkit';
import { SignDocumentDto } from 'src/sign/dto/sign.document.dto';
import type { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller('sign')
export class SignController {
  constructor(private readonly signService: SignService,
  ) { }

  @Post('documents')
  @ResponseMessage("Ký số thành công!")
  async sign(@Body() body: SignDocumentDto) {
    const { SIGN_HEIGHT, SIGN_WIDTH, SIGN_X, SIGN_Y, document_filename, p12_filename, page, password } = body
    // Tọa độ và kích thước ô ký
    // const SIGN_X = 100;
    // const SIGN_Y = 100;
    // const SIGN_WIDTH = 250;
    // const SIGN_HEIGHT = 80

    const pdfPath = join(getRootPath(), `public/files/documents/${document_filename}`)
    const outputPath = join(getRootPath(), `public/files/documents/${document_filename}`)
    const p12Path = join(getRootPath(), `public/files/certs/${p12_filename}`)

    if (!fs.existsSync(pdfPath)) {
      throw new Error('Không tìm thấy file PDF. Kiểm tra lại đường dẫn!');
    }
    if (!fs.existsSync(p12Path)) {
      throw new Error('Không tìm thấy file P12. Kiểm tra lại đường dẫn!');
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const p12Buffer = fs.readFileSync(p12Path);

    // 1. LẤY THÔNG TIN NGƯỜI KÝ
    const certInfo = extractInfoFromP12(p12Buffer, password)
    // console.log('>>> Thông tin người ký:', certInfo);

    // 2. LOAD PDF VÀ CHUẨN BỊ VISUAL
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // --- PHẦN QUAN TRỌNG: LOAD FONT TIẾNG VIỆT ---
    // Đăng ký fontkit
    pdfDoc.registerFontkit(fontkit);

    // Đường dẫn đến file font (Đảm bảo tên file đúng case sensitive)
    const fontPath = join(getRootPath(), 'public/fonts/TIMES.TTF');

    if (!fs.existsSync(fontPath)) {
      throw new Error(`Không tìm thấy file font tại: ${fontPath}. Vui lòng kiểm tra lại tên file font.`);
    }

    const fontBytes = fs.readFileSync(fontPath);
    // Nhúng font vào PDF (subset: true để tối ưu dung lượng)
    const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
    // --------------------------------------------------

    const pages = pdfDoc.getPages();
    const pageToSign = pages[page];

    // Vẽ khung viền
    pageToSign.drawRectangle({
      x: Number(SIGN_X),
      y: Number(SIGN_Y),
      width: Number(SIGN_WIDTH),
      height: Number(SIGN_HEIGHT),
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Tạo nội dung text (Hiển thị có dấu bình thường)
    const dateStr = new Date().toISOString().split('T')[0];
    const text = `Ký số bởi: ${certInfo.commonName}\n` +
      `Email: ${certInfo.email}\n` +
      `Đơn vị: ${certInfo.organization}\n` +
      `Ngày: ${dateStr}`;

    // Vẽ text
    pageToSign.drawText(text, {
      x: Number(SIGN_X) + 5,
      y: Number(SIGN_Y) + 55, // Canh chỉnh tọa độ Y cho chữ nằm giữa khung
      size: 10,
      font: customFont, // <--- QUAN TRỌNG: Phải khai báo font ở đây thì mới hiển thị được tiếng Việt
      color: rgb(0, 0, 0),
      lineHeight: 12,
    });

    // 4. TẠO PLACEHOLDER (WIDGET ẨN ĐỂ CHỨA CHỮ KÝ SỐ)
    // Lưu ý: Các trường metadata trong này KHÔNG hỗ trợ tiếng Việt có dấu (WinAnsi Error)
    // Nên ta phải dùng hàm removeVietnameseTones
    pdflibAddPlaceholder({
      pdfDoc: pdfDoc,
      pdfPage: pageToSign,
      reason: 'Digital Signature',
      contactInfo: certInfo.email || 'signpdf@example.com',
      name: removeVietnameseTones(certInfo.commonName), // <--- SỬA: Xóa dấu để tránh lỗi WinAnsi
      location: 'Viet Nam',
      // Đặt widget đè lên đúng vị trí khung vừa vẽ
      widgetRect: [SIGN_X, SIGN_Y, SIGN_WIDTH, SIGN_HEIGHT],
    });

    // 5. KÝ FILE
    // Lưu file PDF (đã có visual + placeholder) ra Buffer tạm
    const pdfWithPlaceholder = Buffer.from(await pdfDoc.save({ useObjectStreams: false }));

    // Khởi tạo Signer
    const signer = new P12Signer(p12Buffer, { passphrase: password });

    // Ký điện tử
    const signedPdf = await signpdf.sign(pdfWithPlaceholder, signer);

    // 6. LƯU FILE KẾT QUẢ
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, signedPdf);

    return outputPath;
  }

  // @Post('test-documents')
  // @ResponseMessage('Ký số thành công và quy trình đã được cập nhật!')
  // async signAndUpdateWorkflow(
  //   @Body() body: SignDocumentDto,
  //   @User() user: IUser,
  // ) {
  //   const {
  //     SIGN_HEIGHT ,
  //     SIGN_WIDTH ,
  //     SIGN_X ,
  //     SIGN_Y ,
  //     document_filename,
  //     p12_filename,
  //     page ,
  //     password,
  //   } = body;

  //   if (!document_filename || !p12_filename || !password) {
  //     throw new BadRequestException('Thiếu thông tin bắt buộc');
  //   }

  //   // ==================== 1. TÌM DOCUMENT THEO FILENAME ====================
  //   const document = await this.documentModel
  //     .findOne({
  //       'info.link': { $regex: document_filename, $options: 'i' },
  //       cur_status: { $in: ['pending', 'progress'] },
  //     })
  //     .populate([
  //       { path: 'workflow', populate: { path: 'steps.signers.unit steps.signers.position' } },
  //       { path: 'author.user', select: 'name' },
  //     ]);

  //   if (!document) {
  //     throw new BadRequestException('Không tìm thấy tài liệu hoặc đã hoàn tất ký');
  //   }

  //   // ==================== 2. KIỂM TRA QUYỀN KÝ (QUAN TRỌNG NHẤT) ====================
  //   const currentStepIndex = document.cur_step || 0;
  //   const currentWorkflowStep = document.workflow?.steps?.[currentStepIndex];

  //   if (!currentWorkflowStep) {
  //     throw new ForbiddenException('Bước ký không tồn tại trong quy trình');
  //   }

  //   const isAuthorized = currentWorkflowStep.signers.some((s) => {
  //     const matchUnit = !s.unit || s.unit.toString() === user.unit?.toString();
  //     const matchPosition =
  //       !s.position || s.position.toString() === user.position?.toString();
  //     return matchUnit && matchPosition;
  //   });

  //   if (!isAuthorized) {
  //     throw new ForbiddenException('Bạn không có quyền ký ở bước này');
  //   }

  //   // ==================== 3. KÝ PDF (giữ nguyên code đẹp của bạn) ====================
  //   const pdfPath = join(getRootPath(), `public/files/documents/${document_filename}`);
  //   const p12Path = join(getRootPath(), `public/files/certs/${p12_filename}`);

  //   if (!fs.existsSync(pdfPath)) throw new BadRequestException('File PDF không tồn tại');
  //   if (!fs.existsSync(p12Path)) throw new BadRequestException('File P12 không tồn tại');

  //   const pdfBuffer = fs.readFileSync(pdfPath);
  //   const p12Buffer = fs.readFileSync(p12Path);

  //   // Lấy thông tin người ký
  //   const certInfo = extractInfoFromP12(p12Buffer, password);

  //   // Load PDF
  //   const pdfDoc = await PDFDocument.load(pdfBuffer);
  //   pdfDoc.registerFontkit(fontkit);

  //   const fontPath = join(getRootPath(), 'public/fonts/TIMES.TTF');
  //   if (!fs.existsSync(fontPath)) throw new Error('Font TIMES.TTF không tồn tại');
  //   const fontBytes = fs.readFileSync(fontPath);
  //   const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });

  //   const pages = pdfDoc.getPages();
  //   const pageToSign = pages[page];

  //   // Vẽ khung + chữ
  //   pageToSign.drawRectangle({
  //     x: Number(SIGN_X),
  //     y: Number(SIGN_Y),
  //     width: Number(SIGN_WIDTH),
  //     height: Number(SIGN_HEIGHT),
  //     borderColor: rgb(0, 0, 0),
  //     borderWidth: 1,
  //   });

  //   const dateStr = new Date().toISOString().split('T')[0];
  //   const text = `Ký số bởi: ${certInfo.commonName}\nEmail: ${certInfo.email}\nĐơn vị: ${certInfo.organization}\nNgày: ${dateStr}`;

  //   pageToSign.drawText(text, {
  //     x: Number(SIGN_X) + 5,
  //     y: Number(SIGN_Y) + 55,
  //     size: 10,
  //     font: customFont,
  //     color: rgb(0, 0, 0),
  //     lineHeight: 12,
  //   });

  //   // Tạo placeholder cho chữ ký số
  //   pdflibAddPlaceholder({
  //     pdfDoc,
  //     pdfPage: pageToSign,
  //     reason: 'Digital Signature',
  //     contactInfo: certInfo.email || 'noreply@company.com',
  //     name: removeVietnameseTones(certInfo.commonName),
  //     location: 'Viet Nam',
  //     widgetRect: [SIGN_X, SIGN_Y, SIGN_WIDTH, SIGN_HEIGHT],
  //   });

  //   // Ký số
  //   const pdfWithPlaceholder = Buffer.from(await pdfDoc.save({ useObjectStreams: false }));
  //   const signer = new P12Signer(p12Buffer, { passphrase: password });
  //   const signedPdf = await signpdf.sign(pdfWithPlaceholder, signer);

  //   // Lưu file mới (ghi đè hoặc tạo file mới – bạn chọn)
  //   const outputPath = pdfPath; // ghi đè file cũ
  //   fs.writeFileSync(outputPath, signedPdf);

  //   // ==================== 4. CẬP NHẬT WORKFLOW (tự động) ====================
  //   const totalSteps = document.workflow.steps.length;
  //   const nextStep = currentStepIndex + 1;
  //   const newStatus = nextStep >= totalSteps ? 'confirmed' : 'progress';
  //   const newVersion = (document.cur_version || 0) + 1;

  //   await this.documentModel.updateOne(
  //     { _id: document._id },
  //     {
  //       $set: {
  //         cur_link: document.cur_link, // giữ nguyên link (hoặc đổi tên file nếu muốn)
  //         cur_step: nextStep,
  //         cur_status: newStatus,
  //         cur_version: newVersion,
  //       },
  //       $push: {
  //         info: {
  //           version: newVersion,
  //           link: document.cur_link,
  //           signers: [
  //             {
  //               user: user._id,
  //               unit: user.unit,
  //               position: user.position,
  //             },
  //           ],
  //         },
  //       },
  //     },
  //   );

  //   return {
  //     message: 'Ký số thành công! Quy trình đã được cập nhật.',
  //     data: {
  //       documentId: document._id,
  //       version: newVersion,
  //       step: nextStep,
  //       status: newStatus,
  //       signed_at: new Date(),
  //     },
  //   };
  // }
}