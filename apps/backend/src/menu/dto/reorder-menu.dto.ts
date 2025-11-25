import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ReorderMenuDto {
  @ApiProperty({
    description: 'New order inside the new parent. Default: append last',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order: number;
}
