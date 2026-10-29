import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../services/user-service';

export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
}

@Controller('api/users')
export class UsersRoute {
  constructor(private readonly userService: UserService) {}

  @Post()
  async register(@Body() body: RegisterUserDto) {
    try {
      const result = await this.userService.register(
        body.name,
        body.email,
        body.password,
      );
      return { data: result };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Email sudah terdaftar';
      throw new HttpException(
        { error: message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
