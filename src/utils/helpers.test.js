import { describe, it, expect } from 'vitest';
import { formatDate, formatNumber, formatBalance } from './helpers';

describe('helpers', () => {
  describe('formatNumber', () => {
    it('formats thousands correctly', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });
  });

  describe('formatDate', () => {
    it('formats Arabic date correctly', () => {
      const date = '2026-01-05';
      const formatted = formatDate(date, 'ar');
      expect(formatted).toContain('05');
      expect(formatted).toContain('كانون الثاني');
      expect(formatted).toContain('2026');
    });

    it('formats English date correctly', () => {
      const date = '2026-01-05';
      const formatted = formatDate(date, 'en');
      expect(formatted).toBe('05 Jan 2026');
    });
  });

  describe('formatBalance', () => {
    it('formats positive balance', () => {
      const result = formatBalance(1500);
      expect(result.text).toBe('1,500');
      expect(result.isNegative).toBe(false);
    });

    it('formats negative balance', () => {
      const result = formatBalance(-1500);
      expect(result.text).toBe('(1,500)');
      expect(result.isNegative).toBe(true);
    });

    it('rounds balance when requested', () => {
      const result = formatBalance(1234, true);
      expect(result.text).toBe('1,000');
    });
  });
});
