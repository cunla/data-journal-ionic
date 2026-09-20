import {describe, expect, it} from 'vitest';
import {containsCaseInsensitive} from './string.tools';

describe('containsCaseInsensitive', () => {
  it('ignores case on both sides', () => {
    expect(containsCaseInsensitive('Paris, France', 'PARIS')).toBe(true);
  });

  it('matches everything on an empty search term', () => {
    expect(containsCaseInsensitive('Paris', '')).toBe(true);
    expect(containsCaseInsensitive('Paris', null)).toBe(true);
  });

  it('is false for a value that is missing', () => {
    expect(containsCaseInsensitive(null, 'paris')).toBe(false);
    expect(containsCaseInsensitive(undefined, 'paris')).toBe(false);
  });

  it('is false when the term is absent', () => {
    expect(containsCaseInsensitive('Paris', 'berlin')).toBe(false);
  });
});
