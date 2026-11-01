import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatterPipe implements PipeTransform {
  transform(value: number | null | undefined, currency: string = 'USD', decimals: number = 0): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '-';
    }

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      }).format(value);
    } catch {
      return `${currency} ${value.toLocaleString()}`;
    }
  }
}
