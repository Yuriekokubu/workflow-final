import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mobileFormat',
  standalone: true
})
export class MobileFormatPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
