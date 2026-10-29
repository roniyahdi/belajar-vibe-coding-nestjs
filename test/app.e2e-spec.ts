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
    // Clean up test user if exists
    await prisma.user
      .deleteMany({
        where: { email: 'e2e-test@gmail.com' },
      })
      .catch(() => {});
  });

  afterAll(async () => {
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
    return request(app.getHttpServer())
      .get('/health')
      .expect(200);
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
  });
});
