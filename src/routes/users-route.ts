import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { UserService } from '../services/user-service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  RegisterUserDto,
  RegisterUserSchema,
  LoginUserDto,
  LoginUserSchema,
} from '../validations/user-validation';

export { RegisterUserDto, RegisterUserSchema, LoginUserDto, LoginUserSchema };

@Controller('api/users')
export class UsersRoute {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(RegisterUserSchema))
  async register(@Body() body: RegisterUserDto) {
    try {
      const result = await this.userService.register(body);
      return { data: result };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Email sudah terdaftar';
      throw new HttpException({ error: message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginUserSchema))
  async login(@Body() body: LoginUserDto) {
    try {
      const token = await this.userService.login(body);
      return { data: token };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Email atau password salah';
      throw new HttpException({ error: message }, HttpStatus.BAD_REQUEST);
    }
  }
}
