/**
 * Advanced Storage Service
 * Manages localStorage with compression and versioning
 */

interface StorageItem<T> {
  data: T;
  version: number;
  timestamp: string;
  compressed: boolean;
}

class StorageService {
  private static instance: StorageService;
  private prefix = 'nexus_';
  private version = 1;
  private maxStorageSize = 5 * 1024 * 1024; // 5MB

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Set item in storage
   */
  setItem<T>(key: string, value: T): boolean {
    try {
      const item: StorageItem<T> = {
        data: value,
        version: this.version,
        timestamp: new Date().toISOString(),
        compressed: false,
      };

      const json = JSON.stringify(item);
      const size = new Blob([json]).size;

      // Check if we're approaching storage limit
      if (size > this.maxStorageSize * 0.8) {
        console.warn(`⚠️ Storage item too large: ${(size / 1024).toFixed(2)}KB`);
        return false;
      }

      localStorage.setItem(this.prefix + key, json);
      console.log(`💾 Stored: ${key} (${(size / 1024).toFixed(2)}KB)`);
      return true;
    } catch (error) {
      console.error(`❌ Storage error for ${key}:`, error);
      return false;
    }
  }

  /**
   * Get item from storage
   */
  getItem<T>(key: string): T | null {
    try {
      const json = localStorage.getItem(this.prefix + key);
      if (!json) return null;

      const item: StorageItem<T> = JSON.parse(json);

      // Check version compatibility
      if (item.version !== this.version) {
        console.warn(`⚠️ Storage version mismatch for ${key}`);
        return null;
      }

      console.log(`📖 Retrieved: ${key}`);
      return item.data;
    } catch (error) {
      console.error(`❌ Storage retrieval error for ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(this.prefix + key);
      console.log(`🗑️ Removed: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Storage removal error for ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if item exists
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  /**
   * Get all keys
   */
  getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }
    return keys;
  }

  /**
   * Clear all storage
   */
  clearAll(): boolean {
    try {
      const keys = this.getAllKeys();
      keys.forEach(key => this.removeItem(key));
      console.log(`🗑️ Cleared all storage (${keys.length} items)`);
      return true;
    } catch (error) {
      console.error('❌ Storage clear error:', error);
      return false;
    }
  }

  /**
   * Get storage usage
   */
  getUsage(): {
    used: number;
    available: number;
    percentage: number;
  } {
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          used += new Blob([value]).size;
        }
      }
    }

    return {
      used,
      available: this.maxStorageSize - used,
      percentage: (used / this.maxStorageSize) * 100,
    };
  }

  /**
   * Log storage stats
   */
  logStats(): void {
    const usage = this.getUsage();
    const keys = this.getAllKeys();

    console.group('💾 Storage Statistics');
    console.log(`Items: ${keys.length}`);
    console.log(`Used: ${(usage.used / 1024).toFixed(2)}KB / ${(this.maxStorageSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Usage: ${usage.percentage.toFixed(1)}%`);
    console.log(`Keys:`, keys);
    console.groupEnd();
  }

  /**
   * Export all data
   */
  exportData(): Record<string, any> {
    const data: Record<string, any> = {};
    const keys = this.getAllKeys();

    keys.forEach(key => {
      const value = this.getItem(key);
      if (value) {
        data[key] = value;
      }
    });

    return data;
  }

  /**
   * Import data
   */
  importData(data: Record<string, any>): boolean {
    try {
      Object.entries(data).forEach(([key, value]) => {
        this.setItem(key, value);
      });
      console.log(`✅ Imported ${Object.keys(data).length} items`);
      return true;
    } catch (error) {
      console.error('❌ Import error:', error);
      return false;
    }
  }

  /**
   * Backup data to JSON
   */
  backup(): string {
    const data = this.exportData();
    return JSON.stringify(data, null, 2);
  }

  /**
   * Restore from backup
   */
  restore(backup: string): boolean {
    try {
      const data = JSON.parse(backup);
      return this.importData(data);
    } catch (error) {
      console.error('❌ Restore error:', error);
      return false;
    }
  }
}

export const storageService = StorageService.getInstance();
