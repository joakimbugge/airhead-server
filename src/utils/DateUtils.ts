import { addHours, format } from 'date-fns';

export abstract class DateUtils {
  public static format(date: Date = new Date()): string {
    return format(date, 'yyyy-MM-dd HH:mm:ss.SSSSSS');
  }

  public static addHours(hours: number, date: Date = new Date()): Date {
    return addHours(date, hours);
  }
}
