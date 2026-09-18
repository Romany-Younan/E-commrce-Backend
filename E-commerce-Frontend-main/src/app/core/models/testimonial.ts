import { IUserRef } from './populated';

export interface ITestimonial {
  _id: string;
  userId: string | IUserRef;
  userName: string;
  comment: string;
  stars: number;
  status: 'pending' | 'approved' | 'refused';
  isUserViewed: boolean;
  createdAt?: string;
}
