import { AppModule } from '../../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('Login (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /auth/login → credenciales correctas', async () => {
    const credentials = {
      email: 'admin1@gmail.com',
      password: '123456',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
    expect(typeof res.body.access_token).toBe('string');
  });

  it('POST /auth/login → credenciales incorrectas', async () => {
    const credentials = {
      email: 'admin1@gmail.com',
      password: 'wrongpass',
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
