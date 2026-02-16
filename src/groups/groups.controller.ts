import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    return await this.groupsService.create(createGroupDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req) {
    return await this.groupsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.groupsService.findOne(id, req.user.id);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string, @Request() req) {
    return await this.groupsService.getMembers(id, req.user.id);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @Request() req,
  ) {
    return await this.groupsService.addMember(id, addMemberDto, req.user.id);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return await this.groupsService.removeMember(id, userId, req.user.id);
  }

  @Post(':id/leave')
  async leaveGroup(@Param('id') id: string, @Request() req) {
    return await this.groupsService.leaveGroup(id, req.user.id);
  }
}
