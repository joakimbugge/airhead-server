export abstract class TestHelpers {
  public static isArrayUnique<T>(array: T[]): boolean {
    return new Set(array).size === array.length;
  }
}
