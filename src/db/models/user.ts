import {
  prop,
  pre,
  getModelForClass,
  DocumentType,
  Ref,
  mongoose,
  modelOptions,
} from '@typegoose/typegoose';
import validator from 'validator';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Book from './book';
import { databaseService } from '../../index';

@pre<User>('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcryptjs.hash(user.password, 8);
  }
  next();
})
@pre<User>('remove', async function (next) {
  const user = this;
  await databaseService.books.updateMany(
    { reading: user._id },
    { reading: undefined },
  );
  next();
})
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
class User {
  @prop({ required: true, trim: true })
  public name: string;

  @prop({ required: true, trim: true, minlength: 7 })
  public password: string;

  @prop({ required: true })
  public birthdate: string;

  @prop({
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
    validate: {
      validator: v => {
        return validator.isEmail(v);
      },
      message: 'Email is invalid',
    },
  })
  public email: string;

  @prop({ default: 'aasdasda/sdasdasdasd' })
  public userImage: string;

  @prop()
  public tokens: {
    token: string;
  }[];

  @prop({
    ref: () => Book,
    type: mongoose.Schema.Types.ObjectId,
    foreignField: 'reading',
    localField: '_id',
  })
  public orders: Ref<Book>[];

  @prop({
    ref: () => Book,
    type: mongoose.Schema.Types.ObjectId,
    foreignField: 'waitingUsers',
    localField: '_id',
  })
  public waiting: Ref<Book>[];

  public toJSON() {
    return {
      name: this.name,
      email: this.email,
      birthdate: this.birthdate,
      userImage: this.userImage,
      orders: this.orders,
    };
  }

  public static findByCredentials = async (
    email,
    password,
  ): Promise<DocumentType<User>> => {
    const user = await getModelForClass(User).findOne({ email });
    if (!user) {
      throw new Error('Unable to login');
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Unable to password');
    }
    return user;
  };

  public async generateToken(): Promise<string> {
    const user = this as DocumentType<User>;
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET,
    );
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
  }
}

export default User;
