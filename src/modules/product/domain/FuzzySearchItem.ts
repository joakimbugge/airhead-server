import { ApiProperty } from '@nestjs/swagger';
import { Product } from './Product';

export class FuzzySearchItem<T> {
  @ApiProperty()
  public likeness: number;

  @ApiProperty({ type: Product })
  public entity: T;

  constructor(score: number, entity: T) {
    this.likeness = score;
    this.entity = entity;
  }
}
