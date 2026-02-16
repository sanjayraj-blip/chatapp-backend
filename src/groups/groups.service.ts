import { ForbiddenException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entities/groups.entity';
import { Repository } from 'typeorm';
import { GroupMember } from './entities/groupmember.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private groupsRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private groupMembersRepository: Repository<GroupMember>,
  ) {}

  async create(createGroupDto: CreateGroupDto, userId: string) {
    try {
      const createGroup = await this.groupsRepository.create({
        ...createGroupDto,
        createdById: userId,
      });

      const savedGroup = await this.groupsRepository.save(createGroup);

      const groupAdmin = await this.groupMembersRepository.create({
        groupId: savedGroup.id,
        userId: userId,
        role: 'admin',
      });

      await this.groupMembersRepository.save(groupAdmin);
    } catch (e) {
      throw new HttpException(
        e.message || 'Failed to create group',
        e.status || 500,
      );
    }
  }

  async findAll(userId: string) {
    try {
      const groups_of_user = await this.groupMembersRepository.find({
        where: { userId },
        relations: ['groups', 'group.createdBy'],
      });

      return groups_of_user.map((gm) => gm.group);
    } catch (e) {
      throw new HttpException(
        e.message || 'Failed to fetch groups',
        e.status || 500,
      );
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const group = await this.groupsRepository.findOne({
        where: { id },
        relations: ['createdBy', 'members', 'members.user'],
      });

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      const isMember = await this.groupMembersRepository.findOne({
        where: { groupId: id, userId },
      });

      if (!isMember) {
        throw new ForbiddenException('You are not a member of this group');
      }

      return group;
    } catch (e) {
      throw new HttpException(
        e.message || 'Failed to fetch group',
        e.status || 500,
      );
    }
  }

  async addMember(
    groupId: string,
    addMemberDto: AddMemberDto,
    requesterId: string,
  ): Promise<void> {
    try {
      const group = await this.groupsRepository.findOne({
        where: { id: groupId },
      });

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      const requesterMembership = await this.groupMembersRepository.findOne({
        where: { groupId, userId: requesterId },
      });

      if (!requesterMembership || requesterMembership.role !== 'admin') {
        throw new ForbiddenException('Only admins can add members');
      }

      const existingUser = await this.groupMembersRepository.findOne({
        where: { groupId: groupId, userId: addMemberDto.userId },
      });

      if (existingUser) {
        throw new ForbiddenException('User is already a member of the group');
      }

      const newMember = await this.groupMembersRepository.create({
        groupId: groupId,
        userId: addMemberDto.userId,
        role: addMemberDto.role || 'member',
      });

      await this.groupMembersRepository.save(newMember);
    } catch (e) {
      throw new HttpException(
        e.message || 'Failed to add member',
        e.status || 500,
      );
    }
  }

  async removeMember(
    groupId: string,
    userId: string,
    requesterId: string,
  ): Promise<void> {
    // Check if requester is admin
    const requesterMembership = await this.groupMembersRepository.findOne({
      where: { groupId, userId: requesterId },
    });

    if (!requesterMembership || requesterMembership.role !== 'admin') {
      throw new ForbiddenException('Only admins can remove members');
    }

    // Find member to remove
    const memberToRemove = await this.groupMembersRepository.findOne({
      where: { groupId, userId },
    });

    if (!memberToRemove) {
      throw new NotFoundException('Member not found in this group');
    }

    await this.groupMembersRepository.remove(memberToRemove);
  }

  async getMembers(groupId: string, userId: string): Promise<GroupMember[]> {
    // Check if user is a member
    const isMember = await this.groupMembersRepository.findOne({
      where: { groupId, userId },
    });

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return await this.groupMembersRepository.find({
      where: { groupId },
      relations: ['user'],
    });
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const membership = await this.groupMembersRepository.findOne({
      where: { groupId, userId },
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this group');
    }

    await this.groupMembersRepository.remove(membership);
  }
}
