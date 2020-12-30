import {Pipe, PipeTransform} from '@angular/core';
import {DateTime} from 'luxon';

@Pipe({name: 'groupByMonth'})
export class GroupByMonthPipe implements PipeTransform {

  transform(array) {
    return array.reduce((acc, curr) => {
      const plannedDate = DateTime.fromJSDate(new Date(curr.plannedDate)).toFormat('yyyy-MM');
      let item = acc.find(item => item.month === plannedDate);
      if (item) {
        item.events.push(curr);
        item.total += +curr.value;
      } else {
        acc.push({
          'month': plannedDate,
          'total': +curr.value,
          'events': [curr]
        });
      }
      return acc;
    }, []);
  }
}
