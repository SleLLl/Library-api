import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AuthResponse, DatabaseDocument } from '../common/types';
import { databaseService } from '../index';
import User from '../db/models/user';

export type AuthReq = Request & AuthResponse & DatabaseDocument<User>;

export const auth = async (req: AuthReq, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await databaseService.users.findOne({
      _id: decode._id,
      'tokens.token': token,
    });

    if (!user) {
      res.status(400).send({ error: 'Please authenticate' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    if (e.message === 'jwt expired') {
      res.status(400).send({ ok: false, data: 'token expired' });
    }
    res.status(400).send({ ok: false, data: 'Please authenticate' });
  }
};
