import {Pipe, PipeTransform} from '@angular/core';
import {DateTime} from 'luxon';
import {InterviewInterface, InterviewStatus} from "../iio.service";

@Pipe({name: 'groupByMonth'})
export class GroupByMonthPipe implements PipeTransform {

  transform(array: Array<InterviewInterface>) {
    return array.reduce((acc, curr: InterviewInterface) => {
      const plannedDate = DateTime.fromJSDate(new Date(curr.plannedDate)).toFormat('yyyy-MM');
      let item = acc.find(item => item.month === plannedDate);
      if (!item) {
        item = {
          'month': plannedDate,
          'total': 0,
          'status': {},
          'events': []
        };
        acc.push(item);
      }
      item.events.push(curr);
      item.total += (curr.status === InterviewStatus.Cancelled) ? 0 : +curr.value;
      if (!item.status[curr.status]) {
        item.status[curr.status] = [0, 0];
      }
      item.status[curr.status][0] += 1;
      item.status[curr.status][1] += +curr.value;
      return acc;
    }, []);
  }
}
