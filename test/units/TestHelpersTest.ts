import { TestHelpers } from '../TestHelpers';

describe('isArrayUnique()', () => {
  test('Returns truthy for unique array containg primitives', () => {
    expect(TestHelpers.isUniqueArray([1, 2, 3, 4, 5])).toBeTruthy();
    expect(TestHelpers.isUniqueArray(['foo', 'bar', 'baz'])).toBeTruthy();
    expect(TestHelpers.isUniqueArray(['foo', 1, 'bar', 2, 'baz'])).toBeTruthy();
  });

  test('Returns falsy for unique array containg objects', () => {
    expect(TestHelpers.isUniqueArray(['foo', 1, 'bar', 2, 'baz', 3])).toBeTruthy();
  });

  test('Returns falsy for non-unique array containg primitives', () => {
    expect(TestHelpers.isUniqueArray([1, 1, 3, 4, 5])).toBeFalsy();
    expect(TestHelpers.isUniqueArray(['foo', 'foo', 'baz'])).toBeFalsy();
    expect(TestHelpers.isUniqueArray(['foo', 1, 'bar', 2, 'baz', 2, 'baz'])).toBeFalsy();
  });
});
