import {DateTime} from "luxon";


export class CsvTools {
  static convertToCsv(objArray, headerList): string {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    const rows: string[] = [];
    rows.push(['Line#', ...headerList].join(','));
    for (let i = 0; i < array.length; i++) {
      const line = [CsvTools.formatAsString(i + 1)];
      for (const head of headerList) {
        line.push(CsvTools.formatAsString(array[i][head]));
      }
      rows.push(line.join(','));
    }
    return rows.join('\r\n') + '\r\n';
  }

  private static formatAsString(obj) {
    if (obj instanceof Date) {
      return '"' + DateTime.fromJSDate(obj).toISO() + '"';
    }
    if (obj === null || obj === undefined) {
      return '""';
    }
    // Double any quote inside the value, as CSV requires
    return '"' + String(obj).replace(/"/g, '""') + '"';
  }
}
