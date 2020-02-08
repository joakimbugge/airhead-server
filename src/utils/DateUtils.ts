import { format } from 'date-fns';

export abstract class DateUtils {
  public static format(date: Date): string {
    return format(date, 'yyyy-MM-dd HH:mm:ss.SSSSSS');
  }
}
