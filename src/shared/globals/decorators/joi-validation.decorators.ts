/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { JoiRequestValidationError } from '@globals/helpers/error-handlers';
import { Request } from 'express';
import { ObjectSchema } from 'joi';

type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;

export function joiValidator(schema: ObjectSchema): IJoiDecorator {
  return(_target: any, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req: Request = args[0];
      const { error }  = await Promise.resolve(schema.valid(req.body));
      if(error?.details){
        throw new JoiRequestValidationError(error.details[0].message);
      }
    };
  };
}
