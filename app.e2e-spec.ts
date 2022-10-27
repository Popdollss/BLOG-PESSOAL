import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';

describe ('Testes dos modulos Usuários e Auth (e2e)', () => {
  let token: any; // string
  let usuarioId: any; // number
  let app: INestApplication;

  beforeAll (async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule ({
    imports: [
      TypeOrmModule.forRoot ({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'root',
        database: 'db_blogpessoal_teste',
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
        dropSchema: true
      })
    ],
  }).compile ();
  
  app = moduleFixture.createNestApplication ();
  await app.init (); 
});
  
  afterAll (async () => {
    await app.close ();
  })
  
  it ('01 - Deve Cadastrar usuário', async () => {
    const resposta = await request (app.getHttpServer ())
    .post ('/usuario/cadastrar')
    .send({
      nome: 'root',
      usuario: 'root@root.com',
      senha: 'rootroot',
      foto: ' '
    });
    expect (201)
    usuarioId = resposta.body.id;
  })

  it ('02 - Deve Autenticar Usuário (login)', async () => {
    const resposta = await request (app.getHttpServer())
    .post('/auth/logar')
    .send({
      usuario: 'root@root.com',
      senha: 'rootroot'
    });
    expect (200)

    token = resposta.body.token
  });
  
  it ('03 - Não deve duplicar o usuário', async () => {
    request(app.getHttpServer())
    .post ('/usuario/cadastrar')
    .send({
      nome: "root",
      usuario: "root@root.com",
      senha: "rootroot",
      foto: ' '
    })
    expect (400)
  })
  
  it ('04 - Deve listar todos os usuários', async () => {
    request(app.getHttpServer())
    .get('/usuario/all')
    .set('Authorization', `${token}`)
    .set({})
    expect (200)
  })

  it ('05 - Deve atualizar um usuário', async () => {
    request(app.getHttpServer())
    .put ('/usuario/atualizar')
    .set('authorization', `${token}`)
    .send ({
      id: usuarioId,
      nome: "Root Atualizado",
      usuario: "root@root.com",
      senha: "rootroot",
      foto: ' '
    })
  
  .then (resposta => {
    expect ('Root Atualizado').toEqual(resposta.body.name)
  })
  expect (200)
  })
});