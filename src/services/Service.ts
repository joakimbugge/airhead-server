import { FindConditions, FindOneOptions, Repository } from 'typeorm';

export abstract class Service<T> {
  protected constructor(private readonly repository: Repository<T>) {
  }

  public find(conditions: FindConditions<T>, options?: FindOneOptions<T>): Promise<T | undefined> {
    return this.repository.findOne(conditions, options);
  }

  public findMany(conditions: FindConditions<T>): Promise<T[]> {
    return this.repository.find(conditions);
  }

  public findById(id: number): Promise<T> {
    return this.repository.findOne(id);
  }

  public get(conditions: FindConditions<T>, options?: FindOneOptions<T>): Promise<T> {
    return this.repository.findOneOrFail(conditions, options);
  }

  public save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  public delete(entity: T, softDelete = true): Promise<T> {
    if (softDelete) {
      (entity as any).deletedAt = new Date();
      return this.repository.save(entity);
    }

    return this.repository.remove(entity);
  }

  public deleteMany(entities: T[], softDelete = true): Promise<T[]> {
    if (softDelete) {
      return this.repository.save(entities.map(entity => (entity as any).deletedAt = new Date()) as any[]);
    }

    return this.repository.remove(entities);
  }
}
