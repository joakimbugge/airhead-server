import { Exclude, Expose } from 'class-transformer';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './Product';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  public path: string;

  @ManyToOne(() => Product, product => product.images)
  @Exclude()
  public product: Product;

  @CreateDateColumn()
  @Exclude({ toPlainOnly: true })
  public createdAt: Date;

  @UpdateDateColumn()
  @Exclude({ toPlainOnly: true })
  public updatedAt: Date;

  @Expose({ name: 'fullPath' })
  public getFullPath(): string {
    return `${this.path}/${this.name}`;
  }
}
