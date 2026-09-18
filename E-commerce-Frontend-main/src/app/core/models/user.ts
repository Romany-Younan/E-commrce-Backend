export interface IUser {
  _id: string;
  name: string;
  email?: string;
  role: string;
  isActive: boolean;
  mobile?: string;
  phoneNumber?: string;
  gender?: string;
  createdAt?: string;
}
