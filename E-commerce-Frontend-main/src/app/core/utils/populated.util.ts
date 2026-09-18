import { IUserRef } from '../models/populated';

export function getUserName(userId: string | IUserRef | undefined, fallback = 'N/A'): string {
  if (!userId || typeof userId === 'string') return fallback;
  return userId.name || fallback;
}

export function getOrderIdDisplay(orderId: string | { _id: string }): string {
  return typeof orderId === 'string' ? orderId : orderId._id;
}
