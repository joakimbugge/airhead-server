import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/domain/User';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Index({ fulltext: true })
  public name: string;

  @Column()
  public amount: number;

  @Column()
  public amountThreshold: number;

  @ManyToOne(() => User, user => user.products)
  @Exclude({ toPlainOnly: true })
  public user: User;

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
