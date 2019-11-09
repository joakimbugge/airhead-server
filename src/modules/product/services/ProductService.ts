import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fuzzball from 'fuzzball';
import { Repository } from 'typeorm';
import { Service } from '../../../services/Service';
import { User } from '../../user/domain/User';
import { FuzzySearchItem } from '../domain/FuzzySearchItem';
import { Product } from '../domain/Product';

@Injectable()
export class ProductService extends Service<Product> {
  constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>) {
    super(productRepository);
  }

  public async search(
    term: string,
    user: User,
    minAllowedLikeness: number = 10,
  ): Promise<Array<FuzzySearchItem<Product>>> {
    const products = await this.findMany({ user });

    return products.map(product => new FuzzySearchItem(fuzzball.ratio(product.name, term), product))
      .filter(searchItem => searchItem.likeness >= minAllowedLikeness)
      .sort((a, b) => b.likeness - a.likeness);
  }
}
