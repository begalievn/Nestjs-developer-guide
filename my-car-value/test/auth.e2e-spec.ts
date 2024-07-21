import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    const email = 'asdf33333@gmail.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: '12345' })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(email);
      });
  });

  it('should sign up and get logged in user', async () => {
    const email = 'hello2233@gmial.com';

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: '12345' })
      .expect(201);

    const cookie = res.get('Set-Cookie');
    console.log('cookie', cookie);

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);
    expect(body.email).toEqual(email);
  });
});
