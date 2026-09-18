import { IProduct } from './product';
import { IUserRef } from './populated';

export interface IOrderItem {
  productId: IProduct | string;
  productNameSnapshot: string;
  quantity: number;
  priceSnapshot: number;
  _id?: string;
}

export interface IOrder {
  _id: string;
  userId: string | IUserRef;
  items: IOrderItem[];
  totalPrice: number;
  status: string;
  addressSnapshot: string;
  phoneNumber: string;
  backupPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}
