import { describe, it, expect } from '@jest/globals';
import { generateId, paginate } from '../index.js';

describe('Utils', () => {
  describe('generateId', () => {
    it('generates a valid UUID', () => {
      const id = generateId();
      expect(id).toBeDefined();
      expect(id).toHaveLength(36);
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('generates unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('paginate', () => {
    it('paginates an array correctly', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      const page1 = paginate(items, 1, 3);
      expect(page1.data).toEqual([1, 2, 3]);
      expect(page1.total).toBe(10);
      expect(page1.page).toBe(1);
      expect(page1.totalPages).toBe(4);

      const page2 = paginate(items, 2, 3);
      expect(page2.data).toEqual([4, 5, 6]);

      const page4 = paginate(items, 4, 3);
      expect(page4.data).toEqual([10]);
    });

    it('handles an empty array', () => {
      const result = paginate([], 1, 10);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('uses default values when page or limit are omitted', () => {
      const items = [1, 2, 3];
      const result = paginate(items);
      expect(result.data).toEqual([1, 2, 3]);
      expect(result.limit).toBe(10);
    });
  });
});
