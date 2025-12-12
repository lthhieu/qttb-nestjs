import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import aqp from 'api-query-params';
import { LoginBySocial } from 'src/auth/dto/login-by-social.dto';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<User>,) { }

  hashPassword(plaintext: string) {
    const salt = genSaltSync(10);
    return hashSync(plaintext, salt);
  }

  isValidPassword(pass: string, hash: string) {
    return compareSync(pass, hash)
  }

  async create(createUserDto: CreateUserDto) {
    const { email, name, password } = createUserDto

    //check mail exist
    let check = await this.findOneByEmail(createUserDto.email)
    if (check) {
      throw new BadRequestException('Email đã tồn tại trên hệ thống. Vui lòng đăng nhập!')
    }

    //create new user
    let newUser = await this.userModel.create({
      email, name, password: this.hashPassword(password)
    })
    return newUser;
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, projection, population } = aqp(qs);
    let { sort }: { sort: any } = aqp(qs);

    delete filter.page
    delete filter.limit

    page = page ? page : 1
    limit = limit ? limit : 10
    let skip = (page - 1) * limit

    const totalItems = (await this.userModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / limit)

    if (!sort) {
      sort = '-updatedAt'
    }

    let users = await this.userModel.find(filter).select('-password -refreshToken')
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select(projection)
      // .populate(['unit', 'position'], 'name -_id')
      .exec();

    return {
      meta: {
        current: page,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result: users
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ')
    }
    const user = await this.userModel.findOne({ _id: id }).select('-password -refreshToken')
      .populate(['unit', 'position'], 'name -_id')
    if (!user) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng')
    }
    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ')
    }
    const { email } = updateUserDto
    const user = await this.findOneByEmail(email ? email : 'abc')

    //check unique email
    if (user && JSON.stringify(user._id) !== JSON.stringify(id)) {
      throw new BadRequestException('Email đã tồn tại trên hệ thống')
    }
    return await this.userModel.updateOne({ _id: id }, updateUserDto)
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID không hợp lệ')
    }
    return await this.userModel.deleteOne({ _id: id })
  }

  async findOneByEmail(email: string) {
    return await this.userModel.findOne({ email }).lean()
  }

  async updateRefreshToken(refreshToken: string | null, _id: string) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('ID không hợp lệ')
    }
    return await this.userModel.findByIdAndUpdate({ _id }, { refreshToken }).lean();

  }

  async findOneByToken(refreshToken: string) {
    return await this.userModel.findOne({ refreshToken }).lean()
  }

  async createBySocial(loginBySocial: LoginBySocial) {
    const { email, image, name, p12, position, role, unit } = loginBySocial
    let isExist = await this.findOneByEmail(email)
    if (isExist) return isExist
    let newUser = await this.userModel.create({
      email, image, name, p12, position, role, unit
    })
    return newUser;
  }
}
