import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { signupSchema } from '@auth/schemes/signup';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@globals/helpers/error-handlers';
import { Helpers } from '@globals/helpers/helpers';
import { uploads } from '@globals/helpers/cloudinary-upload';
import HTTP_STATUS from 'http-status-codes';

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid Credentials');
    }
    const authObjectId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId();
    const userObjectId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });
    const results = await uploads(avatarImage, `${userObjectId}`, true, true);
    if (!results || !results.public_id) {
      throw new BadRequestError('File Upload: Error occurred, try again!');
    }

    res.status(HTTP_STATUS.CREATED).json({ message: 'User Created Successfully', authData });
  }
  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as unknown as IAuthDocument;
  }
}
