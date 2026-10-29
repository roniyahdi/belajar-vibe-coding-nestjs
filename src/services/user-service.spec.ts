import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user-service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    mockPrismaService.user.create.mockResolvedValue({
      id: 1,
      name: 'Roni',
      email: 'roni@gmail.com',
      password: 'hashed_password',
      created_at: new Date(),
    });

    const result = await service.register('Roni', 'roni@gmail.com', 'rahasia');

    expect(result).toBe('OK');
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'roni@gmail.com' },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('rahasia', 10);
    expect(mockPrismaService.user.create).toHaveBeenCalledWith({
      data: {
        name: 'Roni',
        email: 'roni@gmail.com',
        password: 'hashed_password',
      },
    });
  });

  it('should throw an error if email is already registered', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'roni@gmail.com',
    });

    await expect(
      service.register('Roni', 'roni@gmail.com', 'rahasia'),
    ).rejects.toThrow('Email sudah terdaftar');

    expect(mockPrismaService.user.create).not.toHaveBeenCalled();
  });
});
