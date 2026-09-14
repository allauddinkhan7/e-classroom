import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: { email: string; passwordHash: string; fullName: string; role: Role }) {
    return this.prisma.user.create({ data });
  }

  async searchOthers(excludeUserId: string, search?: string) {
  return this.prisma.user.findMany({
    where: {
      id: { not: excludeUserId },
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    select: { id: true, fullName: true, email: true, role: true },
    orderBy: { fullName: 'asc' },
    take: 30,
  });
}
}