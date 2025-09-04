import * as http from 'http';
import { IUserToken } from './middlewares/checkToken';

// module augmentation
declare module 'express-serve-static-core' {
  export interface Request extends http.IncomingMessage, Express.Request {
    user?: IUserToken;
  }
}