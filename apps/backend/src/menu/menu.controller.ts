import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto, MoveMenuDto, ReorderMenuDto } from './dto';
import { UpdateMenuDto } from './dto';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { MenuEntity } from './menu.entity';

@ApiTags('menus')
@Controller('api/menus')
export class MenuController {
  constructor(private readonly svc: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'Get all menus as tree' })
  @ApiOkResponse({
    description: 'List of menu items',
    type: MenuEntity,
    isArray: true,
  })
  async getAll() {
    return this.svc.findAllTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single menu item by ID' })
  @ApiParam({ name: 'id', description: 'Menu ID (UUID)' })
  @ApiOkResponse({ description: 'Menu found', type: MenuEntity })
  @ApiNotFoundResponse({ description: 'Menu not found' })
  async getOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new menu item' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiCreatedResponse({
    description: 'Menu successfully created',
    type: MenuEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid payload or parent not found' })
  async create(@Body() dto: CreateMenuDto) {
    return this.svc.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a menu item' })
  @ApiParam({ name: 'id', description: 'Menu ID (UUID)' })
  @ApiOkResponse({
    description: 'OK',
    type: MenuEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid update or cycle detected' })
  @ApiNotFoundResponse({ description: 'Menu not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.svc.update(id, dto);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move menu item to another parent' })
  @ApiParam({ name: 'id', description: 'Menu ID (UUID)' })
  @ApiOkResponse({
    description: 'OK',
    type: MenuEntity,
  })
  async move(@Param('id') id: string, @Body() dto: MoveMenuDto) {
    return this.svc.move(id, dto);
  }

  @Patch(':id/reorder')
  @ApiOperation({ summary: 'Reorder menu item within same parent' })
  @ApiParam({ name: 'id', description: 'Menu ID (UUID)' })
  @ApiOkResponse({
    description: 'OK',
    type: MenuEntity,
  })
  async reorder(@Param('id') id: string, @Body() dto: ReorderMenuDto) {
    return this.svc.reorder(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete menu item' })
  @ApiParam({ name: 'id', description: 'Menu ID (UUID)' })
  @ApiOkResponse({ description: 'OK' })
  @ApiBadRequestResponse({ description: 'Failed to delete menu' })
  async remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
