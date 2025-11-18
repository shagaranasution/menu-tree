import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuDto } from './create-menu.dto';
import { IsOptional } from '@nestjs/class-validator';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @IsOptional()
  parentId?: string | undefined;
}
