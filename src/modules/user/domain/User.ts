import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../../product/domain/Product';
import { UserRole } from '../enums/UserRole';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public username: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  public password: string;

  @Column({ unique: true })
  public email: string;

  @OneToMany(() => Product, product => product.user)
  public products: Product[];

  @CreateDateColumn()
  @Exclude({ toPlainOnly: true })
  public createdAt: Date;

  @UpdateDateColumn()
  @Exclude({ toPlainOnly: true })
  public updatedAt: Date;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  public deletedAt: Date;

  @Column({ enum: UserRole, default: UserRole.User })
  @Exclude({ toPlainOnly: true })
  public role: UserRole;
}
