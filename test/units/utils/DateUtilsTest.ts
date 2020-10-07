import { addHours, format } from 'date-fns';
import { DateUtils } from '../../../src/utils/DateUtils';

const formatRegex = /^\d\d\d\d-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01]) (0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]).[0-9]{6}$/;

const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd HH:mm:ss.SSSSSS');

describe('format()', () => {
  it('returns formatted version of specified date', () => {
    const date = new Date('2020-05-06');
    expect(DateUtils.format(date)).toEqual(formatDate(date));
  });

  it('returns a known format', () => {
    expect(DateUtils.format(new Date())).toMatch(formatRegex);
  });
});

describe('addHours()', () => {
  it('adds given number of hours (3) to the given date', () => {
    const hours = 3;
    const date = new Date();
    const targetDate = addHours(date, hours);

    expect(DateUtils.addHours(hours, date)).toEqual(targetDate);
  });

  it('adds given number of hours (0) to the given date', () => {
    const hours = 0;
    const date = new Date();
    const targetDate = addHours(date, hours);

    expect(DateUtils.addHours(hours, date)).toEqual(targetDate);
  });

  it('adds given number of hours (-1) to the given date', () => {
    const hours = -1;
    const date = new Date();
    const targetDate = addHours(date, hours);

    expect(DateUtils.addHours(hours, date)).toEqual(targetDate);
  });
});
