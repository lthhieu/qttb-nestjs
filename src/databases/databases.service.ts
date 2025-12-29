import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from 'src/roles/schemas/role.schema';
import { User } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import { Unit } from 'src/units/schemas/unit.schema';
import { Position } from 'src/positions/schemas/position.schema';
import { ADMIN_ROLE, INIT_POSITIONS, INIT_ROLES, INIT_UNITS, INIT_WORKFLOWS, USER_ROLE } from 'src/databases/sample';
import { Workflow } from 'src/workflows/schemas/workflow.schema';

@Injectable()
export class DatabasesService implements OnModuleInit {
    private readonly logger = new Logger(DatabasesService.name);
    constructor(@InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Unit.name) private unitModel: Model<Unit>,
        @InjectModel(Position.name) private positionModel: Model<Position>,
        @InjectModel(Role.name) private roleModel: Model<Role>,
        @InjectModel(Workflow.name) private workflowModel: Model<Workflow>,
        private configService: ConfigService) { }
    async onModuleInit() {
        const isInit = this.configService.get<string>("SHOULD_INIT")
        if (Boolean(isInit)) {
            const countUser = await this.userModel.countDocuments({})
            const countUnit = await this.unitModel.countDocuments({})
            const countPosition = await this.positionModel.countDocuments({})
            const countRole = await this.roleModel.countDocuments({})
            const countWorkflow = await this.workflowModel.countDocuments({})
            //create units
            if (countUnit === 0) {
                await this.unitModel.insertMany(INIT_UNITS);
                //bulk create
            }

            // create positions
            if (countPosition === 0) {
                await this.positionModel.insertMany(INIT_POSITIONS);
            }

            // create roles
            if (countRole === 0) {
                await this.roleModel.insertMany(INIT_ROLES);
            }

            // create workflows
            if (countWorkflow === 0) {
                await this.workflowModel.insertMany(INIT_WORKFLOWS);
            }

            // create users
            if (countUser === 0) {
                const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE });
                const userRole = await this.roleModel.findOne({ name: USER_ROLE });
                await this.userModel.insertMany([
                    {
                        name: "Hieu Ly Tran Hoang",
                        email: "hieulth@vlute.edu.vn",
                        image: "just an image",
                        role: adminRole?._id,
                        position: "69045a13f3cfb6bd6724d15c",
                        unit: "690431481c4182b8d287b8e3"
                    },
                    {
                        name: "tp_qttb vlute",
                        email: "tp_qttb@vlute.edu.vn",
                        image: "https://lh3.googleusercontent.com/a/ACg8ocKifZnI9Ro4C7wyTKM96VX4PWUutTp-F3xZRkUWBU7Qv8UHoQ=s96-c",
                        role: userRole?._id,
                        position: "69045a13f3cfb6bd6724d15c",
                        unit: "690431481c4182b8d287b8e3"
                    },
                    {
                        name: "bgh",
                        email: "bgh@vlute.edu.vn",
                        image: "just an image",
                        role: userRole?._id,
                        position: "69045afdf3cfb6bd6724d162",
                        unit: "69202b7e7acdfd5a8a9691d6"
                    },
                    {
                        name: "nv",
                        email: "nv@vlute.edu.vn",
                        image: "just an image",
                        role: adminRole?._id,
                        position: "69045a13f3cfb6bd6724d15c",
                        unit: "690431481c4182b8d287b8e3"
                    },
                ])
            }

            if (countUser > 0 && countRole > 0 && countUnit > 0 && countPosition > 0 && countWorkflow > 0) {
                this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
            }

        }
    }
}