import { Body, Controller, Get, Param ,Patch,Request, UseGuards} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard) // All routes are protected
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findById(id);
  }

  @Patch('me')
  async updateMe(@Request() req, @Body() updateUserBody: Partial<User>) {
    return await this.usersService.update(req.user.id, updateUserBody);
  }
}
