export function containsCaseInsensitive(str: string, substr: string): boolean {
  substr = substr ? substr.toLowerCase() : '';
  return (str !== null)
    && (str !== undefined) && (str.toLowerCase().indexOf(substr) !== -1);
}
