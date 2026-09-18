import { IProduct } from './product';

export interface ICartItem {
  cartItemId: string;
  product: IProduct;
  quantity: number;
  price: number;
  totalPrice: number;
  priceChanged?: boolean;
  issue?: string;
  oldPrice?: number;
  newPrice?: number;
  message?: string;
}

export interface ICart {
  cartTotal: number;
  validItems: ICartItem[];
  actionRequiredItems: ICartItem[];
}
