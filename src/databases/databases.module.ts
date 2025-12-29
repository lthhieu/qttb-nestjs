import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Position, PositionSchema } from 'src/positions/schemas/position.schema';
import { Unit, UnitSchema } from 'src/units/schemas/unit.schema';
import { Workflow, WorkflowSchema } from 'src/workflows/schemas/workflow.schema';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Position.name, schema: PositionSchema },
    { name: Unit.name, schema: UnitSchema },
    { name: Workflow.name, schema: WorkflowSchema },
    { name: Role.name, schema: RoleSchema }
  ])],
  controllers: [DatabasesController],
  providers: [DatabasesService],
})
export class DatabasesModule { }
