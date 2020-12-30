import {Pipe, PipeTransform} from '@angular/core';
import {DateTime} from 'luxon';
import {InterviewInterface, InterviewStatus} from "../iio.service";

@Pipe({name: 'groupByMonth'})
export class GroupByMonthPipe implements PipeTransform {

  transform(array: Array<InterviewInterface>) {
    return array.reduce((acc, curr: InterviewInterface) => {
      const plannedDate = DateTime.fromJSDate(new Date(curr.plannedDate)).toFormat('yyyy-MM');
      let item = acc.find(item => item.month === plannedDate);
      if (item) {
        item.events.push(curr);
        item.total += (curr.status === InterviewStatus.Cancelled) ? 0 : +curr.value;
      } else {
        acc.push({
          'month': plannedDate,
          'total': (curr.status === InterviewStatus.Cancelled) ? 0 : +curr.value,
          'events': [curr]
        });
      }
      return acc;
    }, []);
  }
}
