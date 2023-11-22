import { ValidationOptions, registerDecorator } from 'class-validator';
import { IsBeforeConstraint } from './is-before-constraint.validator';

export function IsBefore(
  property: string,
  validationOptions?: ValidationOptions,
) {
  // console.log(property, validationOptions);
  return function (object: object, propertyName: string) {
    // console.log('inner function', object, propertyName);
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsBeforeConstraint,
    });
  };
}
