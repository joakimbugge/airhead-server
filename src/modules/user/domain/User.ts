import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ForgotPasswordToken } from '../../authentication/domain/ForgotPasswordToken';
import { Product } from '../../product/domain/Product';
import { UserRole } from '../enums/UserRole';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  public id: number;

  @Column({ unique: true })
  @ApiProperty()
  public username: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  public password: string;

  @Column({ unique: true })
  @ApiProperty()
  public email: string;

  @OneToMany(() => Product, product => product.user)
  public products: Product[];

  @OneToMany(() => ForgotPasswordToken, token => token.user)
  public forgotPasswordTokens: ForgotPasswordToken[];

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
