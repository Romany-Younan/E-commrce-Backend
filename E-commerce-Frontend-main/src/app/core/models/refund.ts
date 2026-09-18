import { IProduct } from './product';
import { IUserRef } from './populated';

export interface IRefundItem {
  productId: IProduct | string;
  productNameSnapshot: string;
  quantity: number;
  priceSnapshot: number;
}

export interface IRefund {
  _id: string;
  orderId: string | { _id: string };
  userId: string | IUserRef;
  reason: string;
  refundedAmount: number;
  items: IRefundItem[];
  adminResponse?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}
