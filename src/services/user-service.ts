import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
  RegisterUserDto,
  RegisterUserSchema,
  LoginUserDto,
  LoginUserSchema,
} from '../validations/user-validation';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async register(
    dataOrName: RegisterUserDto | string,
    email?: string,
    password?: string,
  ): Promise<string> {
    const rawData: RegisterUserDto =
      typeof dataOrName === 'string'
        ? {
            name: dataOrName,
            email: email as string,
            password: password as string,
          }
        : dataOrName;

    // Validate payload with Zod
    const data = RegisterUserSchema.parse(rawData);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    return 'OK';
  }

  async login(
    dataOrEmail: LoginUserDto | string,
    password?: string,
  ): Promise<string> {
    const rawData: LoginUserDto =
      typeof dataOrEmail === 'string'
        ? {
            email: dataOrEmail,
            password: password as string,
          }
        : dataOrEmail;

    const data = LoginUserSchema.parse(rawData);

    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Email atau password salah');
    }

    const token = uuidv4();

    await this.prisma.session.create({
      data: {
        token,
        user_id: user.id,
      },
    });

    return token;
  }
}
