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

  /**
   * Splits CSV text into rows of values, understanding quoted fields, doubled
   * quotes inside them, separators and newlines within quotes, and either
   * line ending. Blank lines are dropped.
   */
  static parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let value = '';
    let quoted = false;
    let seenValue = false;
    const pushValue = () => {
      row.push(value.trim());
      value = '';
      seenValue = false;
    };
    const pushRow = () => {
      pushValue();
      if (row.some(entry => entry !== '')) {
        rows.push(row);
      }
      row = [];
    };
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (quoted) {
        if (char === '"' && text[i + 1] === '"') {
          value += '"';
          i++;
        } else if (char === '"') {
          quoted = false;
        } else {
          value += char;
        }
        continue;
      }
      if (char === '"' && !seenValue) {
        quoted = true;
        seenValue = true;
      } else if (char === ',') {
        pushValue();
      } else if (char === '\r') {
        // handled by the \n that follows, or ends the row on its own
        if (text[i + 1] !== '\n') {
          pushRow();
        }
      } else if (char === '\n') {
        pushRow();
      } else {
        value += char;
        if (char.trim() !== '') {
          seenValue = true;
        }
      }
    }
    if (value !== '' || row.length) {
      pushRow();
    }
    return rows;
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
