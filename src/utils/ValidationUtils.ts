import { ValidationError } from 'class-validator';

interface Contraints {
  [key: string]: string
}

export abstract class ValidationUtils {
  public static createError(property: string, target: any, contraints: Contraints) {
    const error = new ValidationError();

    error.property = property;
    error.children = [];
    error.target = target;
    error.constraints = contraints;

    return error;
  };
}
