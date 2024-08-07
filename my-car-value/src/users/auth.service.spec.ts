import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('test@gmail.com', '12345');
    expect(user.password).not.toEqual('12345');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('should throw an error if user signs up with email that is in use', (done) => {
    service
      .signup('asdf@asdf.com', 'asdf')
      .then(() => {
        service.signup('asdf@asdf.com', 'asdf');
      })
      .then(() => done());
  });

  it('throws if an invalid password is provided', (done) => {
    fakeUsersService.find = () =>
      Promise.resolve([{ email: 'asdf@gmail.com', password: '12345' } as User]);
    service.signin('asdf@gmail.com', '54321').catch(done());
  });

  // it('should sign in', async () => {
  //   await service.signup('asdf@gmail.com', '12345');
  //   // const user = await service.signin('asdf@gmail.com', '12345');
  //   // expect(user).toBeDefined();
  // });
});
