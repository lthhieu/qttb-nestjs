import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseMessageKey } from 'src/configs/custom.decorator';

export interface Response<T> {
    data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    constructor(private reflector: Reflector) { }
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        const responseMessage = this.reflector.getAllAndOverride<string>(ResponseMessageKey, [
            context.getHandler(),
            context.getClass(),
        ]) ?? ''
        return next.handle().pipe(map(data => ({
            statusCode: context.switchToHttp().getResponse().statusCode,
            message: responseMessage,
            data
        })));
    }
}