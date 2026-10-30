import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user-service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

jest.mock('bcrypt');
jest.mock('uuid');

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    session: {
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

  it('should throw validation error when email format is invalid', async () => {
    await expect(
      service.register('Roni', 'bukan-email', 'rahasia'),
    ).rejects.toThrow();
  });

  describe('login', () => {
    it('should login successfully and return session token', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'roni@gmail.com',
        password: 'hashed_password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (uuidv4 as jest.Mock).mockReturnValue('mock-uuid-token');
      mockPrismaService.session.create.mockResolvedValue({
        id: 1,
        token: 'mock-uuid-token',
        user_id: 1,
        created_at: new Date(),
      });

      const result = await service.login('roni@gmail.com', 'rahasia');

      expect(result).toBe('mock-uuid-token');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'roni@gmail.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('rahasia', 'hashed_password');
      expect(mockPrismaService.session.create).toHaveBeenCalledWith({
        data: {
          token: 'mock-uuid-token',
          user_id: 1,
        },
      });
    });

    it('should throw error when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login('roni@gmail.com', 'rahasia')).rejects.toThrow(
        'Email atau password salah',
      );

      expect(mockPrismaService.session.create).not.toHaveBeenCalled();
    });

    it('should throw error when password does not match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'roni@gmail.com',
        password: 'hashed_password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('roni@gmail.com', 'wrong_password'),
      ).rejects.toThrow('Email atau password salah');

      expect(mockPrismaService.session.create).not.toHaveBeenCalled();
    });

    it('should throw validation error when email format is invalid', async () => {
      await expect(service.login('bukan-email', 'rahasia')).rejects.toThrow();
    });
  });
});
