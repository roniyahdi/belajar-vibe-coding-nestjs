import { Test, TestingModule } from '@nestjs/testing';
import { UsersRoute } from './users-route';
import { UserService } from '../services/user-service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  RegisterUserSchema,
  LoginUserSchema,
} from '../validations/user-validation';

describe('UsersRoute', () => {
  let controller: UsersRoute;

  const mockUserService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersRoute],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UsersRoute>(UsersRoute);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully and return { data: "OK" }', async () => {
      mockUserService.register.mockResolvedValue('OK');

      const payload = {
        name: 'Roni',
        email: 'roni@gmail.com',
        password: 'rahasia',
      };

      const result = await controller.register(payload);

      expect(result).toEqual({ data: 'OK' });
      expect(mockUserService.register).toHaveBeenCalledWith(payload);
    });

    it('should throw HttpException 400 when registration fails', async () => {
      mockUserService.register.mockRejectedValue(
        new Error('Email sudah terdaftar'),
      );

      await expect(
        controller.register({
          name: 'Roni',
          email: 'roni@gmail.com',
          password: 'rahasia',
        }),
      ).rejects.toThrow(
        new HttpException(
          { error: 'Email sudah terdaftar' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('login', () => {
    it('should login successfully and return { data: token }', async () => {
      mockUserService.login.mockResolvedValue('mock-uuid-token');

      const payload = {
        email: 'roni@gmail.com',
        password: 'rahasia',
      };

      const result = await controller.login(payload);

      expect(result).toEqual({ data: 'mock-uuid-token' });
      expect(mockUserService.login).toHaveBeenCalledWith(payload);
    });

    it('should throw HttpException 400 when login fails', async () => {
      mockUserService.login.mockRejectedValue(
        new Error('Email atau password salah'),
      );

      await expect(
        controller.login({
          email: 'roni@gmail.com',
          password: 'wrong_password',
        }),
      ).rejects.toThrow(
        new HttpException(
          { error: 'Email atau password salah' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('ZodValidationPipe', () => {
    describe('RegisterUserSchema', () => {
      const pipe = new ZodValidationPipe(RegisterUserSchema);

      it('should pass valid data', () => {
        const validData = {
          name: 'Roni',
          email: 'roni@gmail.com',
          password: 'rahasia',
        };
        expect(pipe.transform(validData, { type: 'body' })).toEqual(validData);
      });

      it('should throw HttpException 400 for invalid email format', () => {
        const invalidData = {
          name: 'Roni',
          email: 'invalid-email',
          password: 'rahasia',
        };
        expect(() => pipe.transform(invalidData, { type: 'body' })).toThrow(
          new HttpException(
            { error: 'Format email tidak valid' },
            HttpStatus.BAD_REQUEST,
          ),
        );
      });

      it('should throw HttpException 400 when required fields are missing', () => {
        const invalidData = {
          email: 'roni@gmail.com',
        };
        expect(() => pipe.transform(invalidData, { type: 'body' })).toThrow(
          HttpException,
        );
      });
    });

    describe('LoginUserSchema', () => {
      const pipe = new ZodValidationPipe(LoginUserSchema);

      it('should pass valid login data', () => {
        const validData = {
          email: 'roni@gmail.com',
          password: 'rahasia',
        };
        expect(pipe.transform(validData, { type: 'body' })).toEqual(validData);
      });

      it('should throw HttpException 400 for invalid email format', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'rahasia',
        };
        expect(() => pipe.transform(invalidData, { type: 'body' })).toThrow(
          new HttpException(
            { error: 'Format email tidak valid' },
            HttpStatus.BAD_REQUEST,
          ),
        );
      });

      it('should throw HttpException 400 when required fields are missing', () => {
        const invalidData = {
          email: 'roni@gmail.com',
        };
        expect(() => pipe.transform(invalidData, { type: 'body' })).toThrow(
          HttpException,
        );
      });
    });
  });
});
