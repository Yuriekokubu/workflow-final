import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'bangkokDate',
  standalone: true
})
export class BangkokDatePipe implements PipeTransform {

  private datePipe = new DatePipe('en-US');

  transform(value: Date | string | number | null | undefined, format: string = 'dd/MM/yyyy, HH:mm'): string | null {
    return this.datePipe.transform(value, format, 'GMT+7');
  }
}

