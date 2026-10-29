import { Test, TestingModule } from '@nestjs/testing';
import { UsersRoute } from './users-route';
import { UserService } from '../services/user-service';
import { HttpException, HttpStatus } from '@nestjs/common';

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

    const result = await controller.register({
      name: 'Roni',
      email: 'roni@gmail.com',
      password: 'rahasia',
    });

    expect(result).toEqual({ data: 'OK' });
    expect(mockUserService.register).toHaveBeenCalledWith(
      'Roni',
      'roni@gmail.com',
      'rahasia',
    );
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
