import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, TableInheritance, UpdateDateColumn } from 'typeorm';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type ' } })
export class Token {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public hash: string;

  @Column()
  public expiresAt: Date;

  @CreateDateColumn()
  @Exclude({ toPlainOnly: true })
  public createdAt: Date;

  @UpdateDateColumn()
  @Exclude({ toPlainOnly: true })
  public updatedAt: Date;
}
