import { prop, Ref } from '@typegoose/typegoose';
import User from './user';

class Book {
  @prop()
  public name: string;

  @prop()
  public author: string;

  @prop()
  public length: string;

  @prop()
  public released: string;

  @prop()
  public description: string;

  @prop()
  public imageUrl: string;

  @prop()
  stars: number;

  @prop({ default: false })
  isTaken: boolean;

  @prop({
    ref: () => User,
  })
  public reading: Ref<User>;

  @prop({
    ref: () => User,
    default: [],
  })
  public waitingUsers: Ref<User>[];

  public toJSON() {
    return {
      name: this.name,
      isTaken: this.isTaken,
    };
  }
}

export default Book;
