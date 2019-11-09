export class FuzzySearchItem<T> {
  public likeness: number;
  public entity: T;

  constructor(score: number, entity: T) {
    this.likeness = score;
    this.entity = entity;
  }
}
