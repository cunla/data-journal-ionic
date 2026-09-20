import {describe, expect, it} from 'vitest';
import {CsvTools} from './csvtools.service';

describe('CsvTools.convertToCsv', () => {
  const headers = ['start', 'locationName', 'purpose'];

  it('writes a header with the line number column', () => {
    const csv = CsvTools.convertToCsv([], headers);
    expect(csv.split('\r\n')[0]).toBe('Line#,start,locationName,purpose');
  });

  it('gives every row as many columns as the header', () => {
    const csv = CsvTools.convertToCsv(
      [{start: null, locationName: 'Paris', purpose: 'holiday'}], headers);
    const [header, row] = csv.split('\r\n');
    expect(row.split(',').length).toBe(header.split(',').length);
  });

  it('numbers the rows from one', () => {
    const csv = CsvTools.convertToCsv(
      [{locationName: 'a'}, {locationName: 'b'}], ['locationName']);
    expect(csv.split('\r\n')[1]).toBe('"1","a"');
    expect(csv.split('\r\n')[2]).toBe('"2","b"');
  });

  it('doubles quotes inside a value so the column survives', () => {
    const csv = CsvTools.convertToCsv(
      [{purpose: 'Said "hi", then left'}], ['purpose']);
    expect(csv.split('\r\n')[1]).toBe('"1","Said ""hi"", then left"');
  });

  it('writes missing values as an empty column', () => {
    const csv = CsvTools.convertToCsv([{purpose: null}], ['purpose', 'absent']);
    expect(csv.split('\r\n')[1]).toBe('"1","",""');
  });

  it('writes dates as ISO timestamps', () => {
    const csv = CsvTools.convertToCsv(
      [{start: new Date(Date.UTC(2026, 0, 2, 3, 4, 5))}], ['start']);
    expect(csv.split('\r\n')[1]).toContain('2026-01-02T');
  });
});

describe('CsvTools.parseCsv', () => {
  it('reads plain rows', () => {
    expect(CsvTools.parseCsv('a,b\n1,2\n')).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('reads quoted values and drops the quotes', () => {
    expect(CsvTools.parseCsv('"a","b"\r\n"1","2"\r\n')).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('keeps separators and newlines inside quotes', () => {
    expect(CsvTools.parseCsv('"Paris, France","line one\nline two"'))
      .toEqual([['Paris, France', 'line one\nline two']]);
  });

  it('turns a doubled quote back into one', () => {
    expect(CsvTools.parseCsv('"Said ""hi"", then left"'))
      .toEqual([['Said "hi", then left']]);
  });

  it('skips blank lines', () => {
    expect(CsvTools.parseCsv('a,b\n\n1,2\n\n')).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('accepts a space after the separator', () => {
    expect(CsvTools.parseCsv('"1", "Paris"')).toEqual([['1', 'Paris']]);
  });

  it('reads back what convertToCsv writes', () => {
    const csv = CsvTools.convertToCsv(
      [{locationName: 'Say "hi", Paris', purpose: 'holiday'}], ['locationName', 'purpose']);
    expect(CsvTools.parseCsv(csv)).toEqual([
      ['Line#', 'locationName', 'purpose'],
      ['1', 'Say "hi", Paris', 'holiday'],
    ]);
  });

  it('is empty for empty input', () => {
    expect(CsvTools.parseCsv('')).toEqual([]);
  });
});
