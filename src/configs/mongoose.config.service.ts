import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModuleOptions, MongooseOptionsFactory } from "@nestjs/mongoose";

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
    constructor(private configService: ConfigService) { }
    createMongooseOptions(): MongooseModuleOptions {
        const mongodb_uri = this.configService.get<string>('MONGO_URI');
        return {
            uri: mongodb_uri,
        };
    }
}