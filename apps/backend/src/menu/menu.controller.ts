// src/menu/menu.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto';
import { UpdateMenuDto } from './dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('menus')
@Controller('api/menus')
export class MenuController {
  constructor(private readonly svc: MenuService) {}

  @ApiOperation({ summary: 'Get all menus as tree' })
  @Get()
  async getAll() {
    return this.svc.findAllTree();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() dto: CreateMenuDto) {
    return this.svc.create(dto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  // Bonus endpoints (move/reorder) can be added later
}
