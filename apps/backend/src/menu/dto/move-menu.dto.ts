import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class MoveMenuDto {
  @ApiProperty({
    description: 'New parent ID. Null means move to root.',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @ApiProperty({
    description: 'New order inside the new parent. Default: append last',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
