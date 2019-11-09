import { define } from 'typeorm-seeding';
import { Product } from '../../product/domain/Product';
import FakerStatic = Faker.FakerStatic;

define(Product, (faker: FakerStatic) => {
  const product = new Product();

  product.name = faker.commerce.productName();
  product.amount = 2;
  product.amountThreshold = 3;

  return product;
});
