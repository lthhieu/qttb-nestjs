import { PartialType } from '@nestjs/mapped-types';
import { CreateUserPositionDto } from './create-user-position.dto';

export class UpdateUserPositionDto extends PartialType(CreateUserPositionDto) {}
