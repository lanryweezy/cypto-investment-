import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheService } from '../../services/cacheService';

describe('CacheService', () => {
  beforeEach(() => {
    // Clear cache before each test
    cacheService.clear();
  });

  it('should set and get values', () => {
    const key = 'test-key';
    const value = { data: 'test-value' };
    
    cacheService.set(key, value);
    const result = cacheService.get(key);
    
    expect(result).toEqual(value);
  });

  it('should return null for non-existent keys', () => {
    const result = cacheService.get('non-existent-key');
    expect(result).toBeNull();
  });

  it('should return null for expired items', () => {
    vi.useFakeTimers();
    
    const key = 'expiring-key';
    const value = 'test-value';
    
    // Set item with 100ms TTL
    cacheService.set(key, value, 100);
    
    // Advance time by 150ms
    vi.advanceTimersByTime(150);
    
    const result = cacheService.get(key);
    expect(result).toBeNull();
    
    vi.useRealTimers();
  });

  it('should not expire items before TTL', () => {
    vi.useFakeTimers();
    
    const key = 'non-expiring-key';
    const value = 'test-value';
    
    // Set item with 100ms TTL
    cacheService.set(key, value, 100);
    
    // Advance time by 50ms (less than TTL)
    vi.advanceTimersByTime(50);
    
    const result = cacheService.get(key);
    expect(result).toEqual(value);
    
    vi.useRealTimers();
  });

  it('should delete items', () => {
    const key = 'delete-test';
    const value = 'test-value';
    
    cacheService.set(key, value);
    expect(cacheService.has(key)).toBe(true);
    
    cacheService.delete(key);
    expect(cacheService.has(key)).toBe(false);
  });

  it('should clear all items', () => {
    cacheService.set('key1', 'value1');
    cacheService.set('key2', 'value2');
    
    expect(cacheService.size()).toBe(2);
    
    cacheService.clear();
    expect(cacheService.size()).toBe(0);
  });

  it('should return correct size', () => {
    cacheService.set('key1', 'value1');
    cacheService.set('key2', 'value2');
    
    expect(cacheService.size()).toBe(2);
  });

  it('should return correct stats', () => {
    cacheService.set('key1', 'value1');
    cacheService.set('key2', 'value2');
    
    const stats = cacheService.getStats();
    expect(stats.size).toBe(2);
    expect(stats.maxSize).toBe(1000); // Default max size
    expect(stats.percentage).toBe(0.2); // 2/1000 * 100
  });

  it('should have items that exist', () => {
    const key = 'existing-key';
    const value = 'test-value';
    
    cacheService.set(key, value);
    expect(cacheService.has(key)).toBe(true);
  });

  it('should not have items that do not exist', () => {
    expect(cacheService.has('non-existent-key')).toBe(false);
  });

  it('should work with getOrSet pattern', async () => {
    const key = 'getorset-test';
    const value = 'cached-value';
    
    // First call should execute the fetcher
    const result1 = await cacheService.getOrSet(key, async () => {
      return value;
    }, 1000);
    
    expect(result1).toBe(value);
    
    // Second call should return cached value without executing fetcher
    const result2 = await cacheService.getOrSet(key, async () => {
      // This should not be executed
      throw new Error('Fetcher should not be called');
    }, 1000);
    
    expect(result2).toBe(value);
  });

  it('should execute fetcher again when cache expires', async () => {
    vi.useFakeTimers();
    
    const key = 'getorset-expire-test';
    const value1 = 'first-value';
    const value2 = 'second-value';
    let fetcherCallCount = 0;
    
    // First call
    const result1 = await cacheService.getOrSet(key, async () => {
      fetcherCallCount++;
      return fetcherCallCount === 1 ? value1 : value2;
    }, 100);
    
    expect(result1).toBe(value1);
    expect(fetcherCallCount).toBe(1);
    
    // Advance time past TTL
    vi.advanceTimersByTime(150);
    
    // Second call should execute fetcher again
    const result2 = await cacheService.getOrSet(key, async () => {
      fetcherCallCount++;
      return fetcherCallCount === 1 ? value1 : value2;
    }, 100);
    
    expect(result2).toBe(value2);
    expect(fetcherCallCount).toBe(2);
    
    vi.useRealTimers();
  });
});