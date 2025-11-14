
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, ConsoleLogger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        if (status == 413) {
            response
                .status(status)
                .json({
                    "message": "kích thước file > 20MB",
                    "error": "Payload Too Large",
                    "statusCode": status
                });
        }
        if (status == 400) {
            response
                .status(status)
                .json({
                    "message": exception.message,
                    "error": "Lỗi",
                    "statusCode": status
                });
        }
        response
            .status(status)
            .json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
            });
    }
}
