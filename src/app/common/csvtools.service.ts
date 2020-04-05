import * as moment from 'moment';

export class CsvTools {
  static convertToCsv(objArray, headerList): string {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = 'Line#, ';
    // tslint:disable-next-line:forin
    for (const index in headerList) {
      row += headerList[index] + ', ';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = '"' + (i + 1) + '"';
      // tslint:disable-next-line:forin
      for (const index in headerList) {
        const head = headerList[index];
        line += ', ' + CsvTools.formatAsString(array[i][head]);
      }
      str += line + '\r\n';
    }
    return str;
  }

  private static formatAsString(obj) {
    if (obj instanceof Date) {
      return moment(obj).format('"YYYY-MM-DD"');
    }
    if (obj === null) {
      return '""';
    }
    return '"' + obj + '"';
  }
}
