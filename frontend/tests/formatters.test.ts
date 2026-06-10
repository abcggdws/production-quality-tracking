import { describe, it, expect } from 'vitest';
import { calculateProgress, getStatusClass, getSeverityClass } from '../src/utils/formatters';

describe('formatters', () => {
  describe('calculateProgress', () => {
    it('should calculate progress correctly', () => {
      expect(calculateProgress(50, 100)).toBe(50);
      expect(calculateProgress(75, 100)).toBe(75);
      expect(calculateProgress(100, 100)).toBe(100);
    });

    it('should return 0 when total is 0', () => {
      expect(calculateProgress(0, 0)).toBe(0);
    });

    it('should round the result', () => {
      expect(calculateProgress(1, 3)).toBe(33);
      expect(calculateProgress(2, 3)).toBe(67);
    });
  });

  describe('getStatusClass', () => {
    it('should return correct status class', () => {
      expect(getStatusClass('pending')).toBe('status-pending');
      expect(getStatusClass('in_progress')).toBe('status-in_progress');
      expect(getStatusClass('completed')).toBe('status-completed');
    });
  });

  describe('getSeverityClass', () => {
    it('should return correct severity class', () => {
      expect(getSeverityClass('critical')).toBe('severity-critical');
      expect(getSeverityClass('major')).toBe('severity-major');
      expect(getSeverityClass('minor')).toBe('severity-minor');
    });
  });
});