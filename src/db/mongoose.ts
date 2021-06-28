import { Connection, createConnection, Model, Schema } from 'mongoose';
import { getModelForClass } from '@typegoose/typegoose';
import { DatabaseDocument } from '../common/types';
import User from './models/user';
import Book from './models/book';

export default class DatabaseService {
  private readonly connection: Connection;

  public readonly users: Model<DatabaseDocument<User>>;

  public readonly books: Model<DatabaseDocument<Book>>;

  constructor(connectionDsn: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Schema.Types.String as any).checkRequired(
      (v: unknown) => typeof v === 'string',
    );

    const connection = createConnection(connectionDsn, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    connection.catch(error =>
      console.error(`MongoDB connection error: ${error}`),
    );

    this.connection = connection;

    this.users = getModelForClass(User, {
      existingConnection: this.connection,
    });
    this.books = getModelForClass(Book, {
      existingConnection: this.connection,
    });
  }
}
