import { Test, TestingModule } from '@nestjs/testing';
import { UsersRoute } from './users-route';
import { UserService } from '../services/user-service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { RegisterUserSchema } from '../validations/user-validation';

describe('UsersRoute', () => {
  let controller: UsersRoute;
  let userService: UserService;

  const mockUserService = {
    register: jest.fn(),
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
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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

  describe('ZodValidationPipe', () => {
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
});
