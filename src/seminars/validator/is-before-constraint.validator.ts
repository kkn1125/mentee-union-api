import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsBefore', async: false })
export class IsBeforeConstraint implements ValidatorConstraintInterface {
  validate(endDate: any, args: ValidationArguments) {
    const object = args.object as any;
    const startDate = object[args.constraints[0]];
    const copyStartDate = new Date(startDate);
    if (
      args.constraints[0] === 'recruit_end_date' &&
      args.property === 'seminar_start_date'
    ) {
      copyStartDate.setDate(copyStartDate.getDate() + 1);
      return copyStartDate <= endDate;
    } else {
      return startDate <= endDate;
    }
  }

  defaultMessage() {
    return 'start_date must be before end_date';
  }
}
