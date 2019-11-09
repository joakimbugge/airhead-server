import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
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
