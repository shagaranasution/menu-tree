import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateMenuDto,
  MoveMenuDto,
  ReorderMenuDto,
  UpdateMenuDto,
} from './dto';
import type { MenuTree } from './menu.types';
import { MenuEntity } from './menu.entity';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMenuDto): Promise<MenuEntity> {
    if (dto.parentId) {
      const parent = await this.prisma.menu.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) throw new BadRequestException('Parent not found');
    }

    const siblings = await this.prisma.menu.findMany({
      where: { parentId: dto.parentId ?? null },
      orderBy: { order: 'asc' },
    });

    const hasUserProvidedOrder = dto.order !== undefined && dto.order !== null;
    const finalOrder = hasUserProvidedOrder ? dto.order! : siblings.length;

    return this.prisma.$transaction(async (tx) => {
      // If user specifies order → shift siblings
      if (hasUserProvidedOrder) {
        await tx.menu.updateMany({
          where: {
            parentId: dto.parentId ?? null,
            order: { gte: finalOrder },
          },
          data: { order: { increment: 1 } },
        });
      }

      return tx.menu.create({
        data: {
          title: dto.title,
          description: dto.description ?? null,
          parentId: dto.parentId ?? null,
          order: finalOrder,
        },
      });
    });
  }

  async findOne(id: string): Promise<MenuEntity> {
    const menu = await this.prisma.menu.findUnique({ where: { id } });

    if (!menu) throw new NotFoundException('Menu not found');

    return menu;
  }

  async findAllTree(): Promise<MenuEntity[]> {
    const items = await this.prisma.menu.findMany({
      orderBy: [{ title: 'asc' }, { createdAt: 'asc' }],
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

  async update(id: string, dto: UpdateMenuDto): Promise<MenuEntity> {
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

  async move(id: string, dto: MoveMenuDto): Promise<MenuEntity> {
    const item = await this.prisma.menu.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Menu not found');

    // Check cycle
    if (dto.parentId) {
      const all = await this.prisma.menu.findMany();
      const descendants = this.getDescendantIds(all, id);

      if (descendants.includes(dto.parentId))
        throw new BadRequestException('Cannot move menu into its own child');
    }

    const siblings = await this.prisma.menu.findMany({
      where: { parentId: dto.parentId ?? null },
    });

    const newOrder = dto.order !== undefined ? dto.order : siblings.length;

    return this.prisma.$transaction(async (tx) => {
      // Shift siblings if inserting in middle
      await tx.menu.updateMany({
        where: {
          parentId: dto.parentId ?? null,
          order: { gte: newOrder },
        },
        data: { order: { increment: 1 } },
      });

      return tx.menu.update({
        where: { id },
        data: {
          parentId: dto.parentId ?? null,
          order: newOrder,
        },
      });
    });
  }

  async reorder(id: string, dto: ReorderMenuDto): Promise<MenuEntity> {
    const item = await this.prisma.menu.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Menu not found');

    const oldOrder = item.order;
    const newOrder = dto.order;

    if (newOrder === oldOrder) return item;

    return this.prisma.$transaction(async (tx) => {
      if (newOrder < oldOrder) {
        // Moved UP → shift items DOWN
        await tx.menu.updateMany({
          where: {
            parentId: item.parentId,
            order: { gte: newOrder, lt: oldOrder },
          },
          data: { order: { increment: 1 } },
        });
      } else {
        // Moved DOWN → shift items UP
        await tx.menu.updateMany({
          where: {
            parentId: item.parentId,
            order: { gt: oldOrder, lte: newOrder },
          },
          data: { order: { decrement: 1 } },
        });
      }

      return tx.menu.update({
        where: { id },
        data: { order: newOrder },
      });
    });
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
