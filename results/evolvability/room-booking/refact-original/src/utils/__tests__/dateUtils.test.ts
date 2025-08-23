import { addDays, formatLongDate, getTodayString } from '../dateUtils';

describe('dateUtils', () => {
  describe('addDays', () => {
    it('should add positive days', () => {
      const result = addDays('2023-12-01', 5);
      expect(result).toBe('2023-12-06');
    });

    it('should subtract days with negative input', () => {
      const result = addDays('2023-12-01', -3);
      expect(result).toBe('2023-11-28');
    });

    it('should handle month boundaries', () => {
      const result = addDays('2023-11-30', 2);
      expect(result).toBe('2023-12-02');
    });

    it('should handle year boundaries', () => {
      const result = addDays('2023-12-31', 1);
      expect(result).toBe('2024-01-01');
    });
  });

  describe('formatLongDate', () => {
    it('should format date correctly', () => {
      const result = formatLongDate('2023-12-01');
      expect(result).toBe('Friday, December 1, 2023');
    });

    it('should handle different dates', () => {
      const result = formatLongDate('2023-01-15');
      expect(result).toBe('Sunday, January 15, 2023');
    });
  });

  describe('getTodayString', () => {
    it('should return today in YYYY-MM-DD format', () => {
      const mockDate = new Date('2023-12-01T10:00:00Z');
      const originalDate = global.Date;
      
      // Mock Date constructor
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = originalDate.now;
      global.Date.parse = originalDate.parse;
      global.Date.UTC = originalDate.UTC;
      
      const result = getTodayString();
      expect(result).toBe('2023-12-01');
      
      // Restore original Date
      global.Date = originalDate;
    });
  });
});
