import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma.service';

type PrismaModels = keyof Omit<
  PrismaClient,
  | '$connect'
  | '$disconnect'
  | '$on'
  | '$transaction'
  | '$use'
  | '$queryRaw'
  | '$executeRaw'
>;

@Injectable()
export class BaseCrudService<T extends Record<string, any>> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly model: PrismaModels
  ) {}

  async create(data: Partial<T>): Promise<T> {
    return (this.prisma[this.model] as any).create({ data });
  }

  async findAll(): Promise<T[]> {
    return (this.prisma[this.model] as any).findMany();
  }

  async findOne(id: string): Promise<T | null> {
    return (this.prisma[this.model] as any).findUnique({ where: { id } });
  }

  async findOneByEmail(email: string): Promise<T | null> {
    return (this.prisma[this.model] as any).findUnique({ where: { email } });
  }

  async findOneBySlug(slug: string): Promise<T | null> {
    return (this.prisma[this.model] as any).findUnique({ where: { slug } });
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return (this.prisma[this.model] as any).update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<T> {
    return (this.prisma[this.model] as any).delete({ where: { id } });
  }
}
