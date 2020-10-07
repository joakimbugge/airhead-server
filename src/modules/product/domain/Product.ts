import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/domain/User';
import { ProductImage } from './ProductImage';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  public id: number;

  @Column()
  @Index({ fulltext: true })
  @ApiProperty()
  public name: string;

  @Column()
  @ApiProperty()
  public amount: number;

  @Column()
  @ApiProperty()
  public amountThreshold: number;

  @ManyToOne(() => User, user => user.products)
  @Exclude({ toPlainOnly: true })
  public user: User;

  @OneToMany(() => ProductImage, image => image.product, { eager: true })
  public images: ProductImage[];

  @CreateDateColumn()
  @Exclude({ toPlainOnly: true })
  public createdAt: Date;

  @UpdateDateColumn()
  @Exclude({ toPlainOnly: true })
  public updatedAt: Date;

  @DeleteDateColumn()
  @Exclude({ toPlainOnly: true })
  public deletedAt: Date;
}
