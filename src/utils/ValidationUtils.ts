import { ValidationError } from 'class-validator';

export interface Constraints {
  [key: string]: string;
}

export abstract class ValidationUtils {
  public static createError(property: string, target: unknown, constraints: Constraints): ValidationError {
    const error = new ValidationError();

    error.property = property;
    error.children = [];
    error.target = target;
    error.constraints = constraints;

    return error;
  }
}
