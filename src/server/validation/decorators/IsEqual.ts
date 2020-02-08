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
    const [relatedPropertyName] = validationArguments.constraints;
    return `${validationArguments.property} has to be equal ${relatedPropertyName}`;
  }

  public validate(value: any, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
    const [relatedPropertyName] = validationArguments.constraints;
    const relatedValue = validationArguments.object[relatedPropertyName];
    return validationArguments.value === relatedValue;
  }
}

export function IsEqual(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
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
