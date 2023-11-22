import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsBefore', async: false })
export class IsBeforeConstraint implements ValidatorConstraintInterface {
  // validate(propertyValue: string, args: ValidationArguments) {
  //   return propertyValue < args.object[args.constraints[0]];
  // }

  validate(endDate: any, args: ValidationArguments) {
    // console.log(endDate, args);

    const object = args.object as any;
    const startDate = object[args.constraints[0]];
    const copyStartDate = new Date(startDate);
    if (
      args.constraints[0] === 'recruit_end_date' &&
      args.property === 'seminar_start_date'
    ) {
      // console.log('before', copyStartDate);
      copyStartDate.setDate(copyStartDate.getDate() + 1);
      // console.log('after', copyStartDate);
      return copyStartDate <= endDate;
    } else {
      return startDate <= endDate;
    }
  }

  defaultMessage(/* args: ValidationArguments */) {
    return 'start_date must be before end_date';
  }
}
