import * as bcrypt from 'bcrypt';

export class HashUtils {
  public static createHash(text: string): string {
    return bcrypt.hashSync(text, 10);
  }

  public static verifyHash(text: string, hash: string): boolean {
    return bcrypt.compareSync(text, hash);
  }
}
