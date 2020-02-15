import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/domain/User';

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

  @Column({ nullable: true })
  @ApiProperty()
  public image: string;

  @CreateDateColumn()
  @Exclude({ toPlainOnly: true })
  public createdAt: Date;

  @UpdateDateColumn()
  @Exclude({ toPlainOnly: true })
  public updatedAt: Date;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  public deletedAt: Date;
}
