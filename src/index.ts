import express from 'express';
import { createExpressServer } from 'routing-controllers';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import UserController from './controller/user-controller';
import DatabaseService from './db/mongoose';
import GlobalErrorHandler from './middleware/errorHandler';
import BookController from './controller/book-controller';
import * as swaggerDocument from './swagger/openapi.json';

const PORT = process.env.PORT || 3001;

// eslint-disable-next-line import/prefer-default-export
export const databaseService = new DatabaseService(process.env.MONGODB_URL);

const app = createExpressServer({
  routePrefix: '/api',
  controllers: [UserController, BookController],
  middlewares: [GlobalErrorHandler],
  defaultErrorHandler: false,
});

app.use('/static', express.static(`${__dirname}/../avatars`));
app.use(express.json());
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log('server start in ', PORT);
});
