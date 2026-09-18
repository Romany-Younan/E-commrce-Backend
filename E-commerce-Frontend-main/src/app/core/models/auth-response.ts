import { IUser } from './user';

export interface AuthResponse {
  status: string;
  token: string;
  data?: {
    user: IUser;
  };
}
