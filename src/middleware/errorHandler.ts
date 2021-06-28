import {
  ExpressErrorMiddlewareInterface,
  Middleware,
} from 'routing-controllers';
import { NextFunction, Request, Response } from 'express';

@Middleware({ type: 'after' })
export default class GlobalErrorHandler
  implements ExpressErrorMiddlewareInterface
{
  error(error: any, request: Request, response: Response, next: NextFunction) {
    response.send({ data: false, error: error.message });
    next();
  }
}
