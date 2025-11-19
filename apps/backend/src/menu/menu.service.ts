import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto } from './dto';
import type { MenuTree } from './menu.types';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMenuDto) {
    if (dto.parentId) {
      const parent = await this.prisma.menu.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) throw new BadRequestException('Parent not found');
    }

    const menu = this.prisma.menu.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        parentId: dto.parentId ?? null,
        order: dto.order ?? 0,
      },
    });

    return menu;
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });

    if (!menu) throw new NotFoundException('Menu not found');

    return menu;
  }

  async findAllTree() {
    const items = await this.prisma.menu.findMany({
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
    });

    return items;
  }

  private getDescendantIds(all: MenuTree[], id: string) {
    const map = new Map<string, MenuTree[]>();

    for (const item of all) {
      const p = item.parentId ?? '__root';

      if (!map.has(p)) {
        map.set(p, []);
      }

      map.get(p)!.push(item);
    }

    const out: string[] = [];
    const stack = map.get(id) ? [...map.get(id)!] : [];

    while (stack.length) {
      const n = stack.pop();
      if (!n) continue;
      out.push(n.id);
      const children = map.get(n.id);
      if (children) stack.push(...children);
    }

    return out;
  }

  async update(id: string, dto: UpdateMenuDto) {
    const existing = await this.prisma.menu.findUnique({ where: { id } });

    if (!existing) throw new NotFoundException('Menu not found');

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('Cannot set parent to self');
      }

      // check for cycle: fetch all items and ensure parentId is not a descendant
      const all: MenuTree[] = await this.prisma.menu.findMany();
      const descendants = this.getDescendantIds(all, id);

      if (descendants.includes(dto.parentId))
        throw new BadRequestException('Cannot set parent to a descendant');
    }

    const updated = await this.prisma.menu.update({
      where: { id },
      data: {
        title: dto.title ?? undefined,
        description: dto.description ?? undefined,
        parentId: dto.parentId === undefined ? undefined : dto.parentId,
        order: dto.order ?? undefined,
      },
    });

    return updated;
  }

  async remove(id: string) {
    try {
      await this.prisma.menu.delete({ where: { id } });
      return { success: true };
    } catch {
      throw new BadRequestException('Failed to delete menu');
    }
  }
}
