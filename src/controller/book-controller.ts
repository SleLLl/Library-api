import {
  Body,
  JsonController,
  Param,
  Post,
  Req,
  UseBefore,
} from 'routing-controllers';
import 'reflect-metadata';
import { databaseService } from '../index';
import Book from '../db/models/book';
import { auth, AuthReq } from '../middleware/auth';

@JsonController('/books')
export default class BookController {
  @Post()
  async create(@Body() bookData: Book) {
    const book = await databaseService.books.create({ ...bookData });
    return {
      ok: true,
      data: book.toJSON(),
    };
  }

  @Post('/:id')
  @UseBefore(auth)
  async order(@Param('id') id: string, @Req() req: AuthReq) {
    const book = await databaseService.books.findOne({ _id: id });
    if (!book) {
      return {
        ok: false,
        data: {},
      };
    }

    if (book.reading?.toString() === req.user._id.toString()) {
      book.reading = undefined;
      book.isTaken = false;
      await book.save();
      return {
        ok: true,
        data: { removeOrder: true },
      };
    }
    const checkWaiting = book.waitingUsers.find(
      idBook => idBook.toString() !== req.user._id.toString(),
    );
    if (checkWaiting) {
      book.waitingUsers = book.waitingUsers.filter(
        idBook => idBook.toString() !== req.user._id.toString(),
      );
      await book.save();
      return {
        ok: true,
        data: { removeWaiting: true },
      };
    }

    if (book.isTaken) {
      book.waitingUsers.push(req.user);
      await book.save();
      return {
        ok: true,
        data: { waiting: true },
      };
    }
    book.isTaken = true;
    book.reading = req.user;
    await book.save();
    return {
      ok: true,
      data: { order: true },
    };
  }
}
