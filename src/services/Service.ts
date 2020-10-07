import { FindConditions, FindOneOptions, Repository } from 'typeorm';

export abstract class Service<T> {
  protected constructor(private readonly repository: Repository<T>) {}

  public find(conditions: FindConditions<T>, options?: FindOneOptions<T>): Promise<T | undefined> {
    return this.repository.findOne(conditions, options);
  }

  public findMany(conditions: FindConditions<T>): Promise<T[]> {
    return this.repository.find(conditions);
  }

  public get(conditions: FindConditions<T>, options?: FindOneOptions<T>): Promise<T> {
    return this.repository.findOneOrFail(conditions, options);
  }

  public save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  public delete(entity: T, softDelete = true): Promise<T> {
    if (softDelete) {
      return this.repository.softRemove(entity);
    }

    return this.repository.remove(entity);
  }

  public deleteMany(entities: T[], softDelete = true): Promise<T[]> {
    if (softDelete) {
      return this.repository.softRemove(entities);
    }

    return this.repository.remove(entities);
  }
}
