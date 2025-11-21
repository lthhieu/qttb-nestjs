import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { MulterModuleOptions, MulterOptionsFactory } from "@nestjs/platform-express";
import fs from 'fs';
import { diskStorage } from "multer";
import path, { join } from "path";

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {

    getRootPath = () => {
        return process.cwd()
    }

    ensureExists(targetDirectory: string) {
        fs.mkdir(targetDirectory, { recursive: true }, (error) => {
            if (!error) {
                console.log('Directory successfully created, or it already exists.');
                return;
            }
            switch (error.code) {
                case 'EEXIST':
                    // Error:
                    // Requested location already exists, but it's not a directory.
                    break;
                case 'ENOTDIR':
                    // Error:
                    // The parent hierarchy contains a file with the same name as the dir
                    // you're trying to create.
                    break;
                default:
                    // Some other error like permission denied.
                    console.error(error);
                    break;
            }
        });
    }

    createMulterOptions(): MulterModuleOptions {
        return {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const folder = req?.headers?.folder_type ?? "default";
                    this.ensureExists(`public/files/${folder}`);
                    cb(null, join(this.getRootPath(), `public/files/${folder}`))
                },
                filename: (req, file, cb) => {
                    //get image extension
                    let extName = path.extname(file.originalname);
                    //get image's name (without extension)
                    let baseName = path.basename(file.originalname, extName);
                    let finalName = `${baseName}-${Date.now()}${extName}`
                    cb(null, finalName)
                }
            }),
            limits: { fileSize: 2 * 1024 * 1024 }, //20MB
            fileFilter: (req, file, cb) => {
                const allowedFileTypes: string[] = []
                if (req.headers?.folder_type == 'certs') {
                    allowedFileTypes.push('p12')
                } else {
                    allowedFileTypes.push('pdf')
                }
                const fileExtension = file.originalname.split('.').pop()!.toLowerCase();
                const isValidFileType = allowedFileTypes.includes(fileExtension);
                if (!isValidFileType) {
                    cb(new HttpException('Sai định dạng', HttpStatus.UNPROCESSABLE_ENTITY), false);
                } else cb(null, true);
            },

        };
    }
}
