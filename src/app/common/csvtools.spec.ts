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
