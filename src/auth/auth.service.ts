import { ConflictException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/users/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const exisitingEmail = await this.userService.findByEmail(
        registerDto.email,
      );
      if (exisitingEmail) {
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      const user = await this.userService.create({
        email: registerDto.email,
        username: registerDto.username,
        password: hashedPassword,
      });

      const token = await this.generateToken(user);

      return {
        user: await this.sanitizeUser(user),
        access_token: token,
      };
    } catch (e) {
      throw new HttpException(e.message, e.status || 500);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.userService.findByEmail(loginDto.email);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = await this.generateToken(user);

      return {
        user: await this.sanitizeUser(user),
        access_token: token,
      };
    } catch (e) {
      throw new HttpException(e.message, e.status || 500);
    }
  }

  async validateUser(userId: string): Promise<User> {
    try{
        const user = await this.userService.findById(userId);
        if (!user) {
          throw new UnauthorizedException('User not found');
        }
        return user;
    }catch(e){
        throw new HttpException(e.message, e.status || 500);
    }
    
  }

  private async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return this.jwtService.sign(payload);
  }

  private async sanitizeUser(user: User): Promise<User> {
    const { password, ...result } = user;

    return result as User;
  }
}
