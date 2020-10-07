import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsEqual' })
class IsEqualConstraint implements ValidatorConstraintInterface {
  public defaultMessage(validationArguments?: ValidationArguments): string {
    const [relatedPropertyName] = <string[]>validationArguments.constraints;
    return `${validationArguments.property} has to be equal ${relatedPropertyName}`;
  }

  public validate(value: unknown, validationArguments: ValidationArguments): boolean {
    const [relatedPropertyName] = <string[]>validationArguments.constraints;
    const relatedValue: unknown = validationArguments.object[relatedPropertyName];
    return validationArguments.value === relatedValue;
  }
}

export function IsEqual(property: string, validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string): void => {
    registerDecorator({
      name: 'isEqual',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: IsEqualConstraint,
    });
  };
}
