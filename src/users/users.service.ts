import { Injectable, NotFoundException } from '@nestjs/common';
import { privateDecrypt } from 'crypto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { NotFoundError, throwError } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(userdata: Partial<User>): Promise<User> {
    try {
      const user = await this.usersRepository.create(userdata);

      return this.usersRepository.save(user);
    } catch (e) {
      throw new Error(e);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      return user || null;
    } catch (e) {
      throw new Error(e);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await this.usersRepository.findOne({ where: { username } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (e) {
      throw new Error(e);
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (e) {
      throw new Error(e);
    }
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      select: ['id', 'username', 'email', 'avatarUrl', 'isActive', 'createdAt'],
    });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    try {
      const user = await this.findById(id);
      Object.assign(user, updateData);

      return this.usersRepository.save(user);
    } catch (e) {
      throw new Error(e);
    }
  }
}
