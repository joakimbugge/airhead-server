/* tslint:disable:variable-name */
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { getStatusText } from 'http-status-codes';

export class ErrorResponse {
  private _statusCode: HttpStatus = HttpStatus.BAD_REQUEST;
  private _error: string = getStatusText(this._statusCode);
  private _message: string;

  public statusCode(statusCode: HttpStatus): this {
    this._statusCode = statusCode;
    this._error = getStatusText(this._statusCode);
    return this;
  }

  public error(error: string): this {
    this._error = error;
    return this;
  }

  public message(message: any): this {
    this._message = message;
    return this;
  }

  public send(host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const output = {
      statusCode: this._statusCode,
      error: this._error,
    } as any;

    if (this._message) {
      output.message = this._message;
    }

    response.status(this._statusCode).json(output);
  }
}
