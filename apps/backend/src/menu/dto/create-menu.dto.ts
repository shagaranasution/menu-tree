import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ example: 'Dashboard' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    required: false,
    example: 'Main dashboard area',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    example: 'b1080950-3f02-4c0d-9d08-3c8d7f22312b',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({
    required: false,
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
