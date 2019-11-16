import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class Token {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public hash: string;

  @Column()
  public expiresAt: Date;
}
