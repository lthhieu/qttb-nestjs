// src/documents/dto/sign-and-update.dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class SignAndUpdateDto {
    @IsString()
    password: string;

    @IsString()
    p12_filename: string;

    @IsString()
    document_filename: string;

    @IsNumber()
    SIGN_X: number;

    @IsNumber()
    SIGN_Y: number;

    @IsNumber()
    @IsOptional()
    SIGN_WIDTH?: number = 250;

    @IsNumber()
    @IsOptional()
    SIGN_HEIGHT?: number = 80;

    @IsNumber()
    @IsOptional()
    page?: number = 0;

    // Các field từ UpdateInfoDocumentDto (nếu cần)
    @IsString()
    @IsOptional()
    cur_link?: string;

    @IsNumber()
    @IsOptional()
    cur_version?: number;
}