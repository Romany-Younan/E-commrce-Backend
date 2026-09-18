import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderStatus',
  standalone: true
})
export class OrderStatusPipe implements PipeTransform {

  private STATUS_LABELS: Record<string, string> = {
    pending:           'Pending',
    preparing:         'Being Prepared',
    shipped:           'On the Way',
    received:          'Delivered',
    refused:           'Refused',
    cancelledByUser:   'Cancelled by You',
    cancelledByAdmin:  'Cancelled by Store',
    refunded:          'Refunded',
  };

  transform(value: string | undefined | null): string {
    if (!value) return '';
    return this.STATUS_LABELS[value] || value;
  }
}
