import { define } from 'typeorm-seeding';
import { Product } from '../../product/domain/Product';
import FakerStatic = Faker.FakerStatic;

define(Product, (faker: FakerStatic) => {
  const amount = faker.random.number({ min: 0, max: 10 });
  const amountThreshold = faker.random.number({ min: 0, max: 10 });

  const product = new Product();

  product.name = faker.commerce.productName();
  product.amount = amount;
  product.amountThreshold = amountThreshold;

  return product;
});
