import { CurrencyFormatterPipe } from './currency-formatter.pipe';

describe('CurrencyFormatterPipe', () => {
  let pipe: CurrencyFormatterPipe;

  beforeEach(() => {
    pipe = new CurrencyFormatterPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format USD correctly without decimals', () => {
    const result = pipe.transform(120000, 'USD', 0);
    expect(result).toContain('120,000');
    expect(result).toContain('$');
  });

  it('should format INR correctly', () => {
    const result = pipe.transform(2000000, 'INR', 0);
    expect(result).toContain('2,000,000');
  });

  it('should format EUR correctly', () => {
    const result = pipe.transform(90000, 'EUR', 0);
    expect(result).toContain('90,000');
  });

  it('should return "-" for null or undefined or NaN', () => {
    expect(pipe.transform(null)).toBe('-');
    expect(pipe.transform(undefined)).toBe('-');
    expect(pipe.transform(NaN)).toBe('-');
  });
});
