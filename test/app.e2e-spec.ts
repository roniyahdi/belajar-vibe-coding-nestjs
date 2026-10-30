import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController & UsersRoute (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    // Clean up test user and session if exists
    await prisma.session.deleteMany().catch(() => {});
    await prisma.user
      .deleteMany({
        where: { email: 'e2e-test@gmail.com' },
      })
      .catch(() => {});
  });

  afterAll(async () => {
    await prisma.session.deleteMany().catch(() => {});
    await prisma.user
      .deleteMany({
        where: { email: 'e2e-test@gmail.com' },
      })
      .catch(() => {});
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });

  describe('/api/users (POST)', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: 'Roni',
          email: 'e2e-test@gmail.com',
          password: 'rahasia',
        })
        .expect(201)
        .expect({ data: 'OK' });
    });

    it('should return 400 error when email is duplicate', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: 'Roni',
          email: 'e2e-test@gmail.com',
          password: 'rahasia',
        })
        .expect(400)
        .expect({ error: 'Email sudah terdaftar' });
    });

    it('should return 400 error when email format is invalid', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: 'Roni',
          email: 'invalid-email-format',
          password: 'rahasia',
        })
        .expect(400)
        .expect({ error: 'Format email tidak valid' });
    });
  });

  describe('/api/users/login (POST)', () => {
    it('should login successfully with correct credentials and return token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          email: 'e2e-test@gmail.com',
          password: 'rahasia',
        })
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(typeof response.body.data).toBe('string');
      // Verify UUID v4 format
      expect(response.body.data).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );

      // Verify token exists in database session
      const session = await prisma.session.findFirst({
        where: { token: response.body.data },
      });
      expect(session).not.toBeNull();
      expect(session?.token).toBe(response.body.data);
    });

    it('should return 400 error when password is incorrect', () => {
      return request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          email: 'e2e-test@gmail.com',
          password: 'wrong-password',
        })
        .expect(400)
        .expect({ error: 'Email atau password salah' });
    });

    it('should return 400 error when email is not registered', () => {
      return request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          email: 'notfound@gmail.com',
          password: 'rahasia',
        })
        .expect(400)
        .expect({ error: 'Email atau password salah' });
    });

    it('should return 400 error when email format is invalid', () => {
      return request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          email: 'invalid-email-format',
          password: 'rahasia',
        })
        .expect(400)
        .expect({ error: 'Format email tidak valid' });
    });
  });
});
