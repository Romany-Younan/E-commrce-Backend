import { IUser } from './user';

export interface IMessage {
  _id: string;
  userId?: IUser;
  subject: string;
  message: string;
  createdAt?: string;
}
