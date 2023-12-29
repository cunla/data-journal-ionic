/* eslint-disable */
import {Injectable, Pipe, PipeTransform} from '@angular/core';

/**
 * Bolds the beginning of the matching string in the item
 */
@Pipe({
  name: 'boldprefix'
})
@Injectable()
export class BoldPrefix implements PipeTransform {
  transform(value: string, keyword: string): any {
    if (!keyword) {
      return value;
    }

    const escaped_keyword = keyword.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

    return value.replace(
      new RegExp(
        escaped_keyword,
        'gi'
      ),
      function (str) {
        return `<b>${str}</b>`;
      }
    );
  }
}
