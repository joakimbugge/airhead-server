export class VerifiedBearerToken {
  private id: number;
  public iat: number;
  public exp: number;

  constructor(id: number, iat: number, exp: number) {
    this.id = id;
    this.iat = iat;
    this.exp = exp;
  }
}
