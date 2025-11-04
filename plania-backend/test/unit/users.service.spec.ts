import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const userModelMock = jest.fn().mockImplementation((dto) => {
      return {
        ...dto,
        save: jest.fn().mockImplementation(async () => {
          return {
            _id: 'mock-id',
            name: dto.name,
            email: dto.email,
            password: dto.password, // ya viene hasheado desde el servicio
            role: dto.role ?? 'user',
            interests: dto.interests ?? [],
          };
        }),
      };
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: userModelMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crear un usuario con contraseña hasheada', async () => {
    const dto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'secure123',
    };

    const result = await service.create(dto);

    expect(result.email).toBe(dto.email);
    expect(result.password).not.toBe(dto.password);
    expect(await bcrypt.compare(dto.password, result.password)).toBe(true);
  });

  it('debería lanzar error si el email ya existe', async () => {
    const dto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'secure123',
    };

    const error = { code: 11000, message: 'Duplicate key error' };

    const failingModel = jest.fn().mockImplementation(() => ({
      ...dto,
      save: jest.fn().mockRejectedValue(error),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: failingModel,
        },
      ],
    }).compile();

    const failingService = module.get<UsersService>(UsersService);

    await expect(failingService.create(dto)).rejects.toMatchObject({ code: 11000 });
  });
});
