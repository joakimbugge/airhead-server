import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  public name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty()
  public amount: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty()
  public amountThreshold: number;
}
