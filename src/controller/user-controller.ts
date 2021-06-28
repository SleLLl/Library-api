import {
  Body,
  Get,
  JsonController,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseBefore,
} from 'routing-controllers';
import 'reflect-metadata';
import multer from 'multer';
import { File } from 'sharp';
import User from '../db/models/user';
import { databaseService } from '../index';
import { auth, AuthReq } from '../middleware/auth';
import uploadAssets from '../services/uploadAssets';

const upload = multer({
  limits: {
    fileSize: 1_000_000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(gif|png|jpg|jpeg|svg)$/)) {
      cb(new Error('please load the image'));
    }
    cb(undefined, true);
  },
});

@JsonController('/users')
export default class UserController {
  @Get()
  @UseBefore(auth)
  getMe(@Req() req: AuthReq) {
    return {
      ok: true,
      data: req.user.toJSON(),
    };
  }

  @Post()
  async create(@Body() userData: User) {
    const user = await databaseService.users.create({ ...userData });
    const token = await user.generateToken();
    return {
      ok: true,
      data: { user: user.toJSON(), token },
    };
  }

  @Post('/login')
  async login(@Body() credentials: { password: string; email: string }) {
    const user = await databaseService.users.findByCredentials(
      credentials.email,
      credentials.password,
    );
    if (!user) {
      return {
        ok: false,
        data: {},
      };
    }
    const token = await user.generateToken();
    return {
      ok: true,
      data: { user: user.toJSON(), token },
    };
  }

  @Post('/logout')
  @UseBefore(auth)
  async logOut(@Body() userData: User, @Req() req: AuthReq) {
    req.user.tokens = req.user.tokens.filter(token => token !== req.token);
    await req.user.save();
    return {
      ok: true,
    };
  }

  @Post('/avatar')
  @UseBefore(auth)
  async setAvatar(
    @UploadedFile('avatar', { options: upload }) file: File,
    @Req() req: AuthReq,
  ) {
    const url = await uploadAssets(file);
    req.user.userImage = url;
    await req.user.save();
    return {
      ok: true,
      data: url,
    };
  }

  @Patch()
  @UseBefore(auth)
  async update(@Body() userData: User, @Req() req: AuthReq) {
    const keys = Object.keys(userData);
    keys.forEach(key => (req.user[key] = userData[key]));
    await req.user.save();
    return {
      ok: true,
      data: req.user.toJSON(),
    };
  }

  @Get('/waiting')
  @UseBefore(auth)
  async getMyBookWaiting(@Req() req: AuthReq) {
    const books = await databaseService.books.find({
      waitingUsers: req.user._id,
    });
    return {
      ok: true,
      data: books.map(book => book.toJSON()),
    };
  }

  @Get('/orders')
  @UseBefore(auth)
  async getMyBookOrders(@Req() req: AuthReq) {
    const books = await databaseService.books.find({ reading: req.user._id });

    return {
      ok: true,
      data: books.map(book => book.toJSON()),
    };
  }
}
