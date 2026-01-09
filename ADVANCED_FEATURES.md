# NexusCrypto - Advanced Features Guide

## 🚀 New Advanced Services

### 1. Performance Monitoring Service

Track app performance in real-time:

```typescript
import { performanceService } from './services/performanceService';

// Record a metric
performanceService.recordMetric('api-call', 250, 'api');

// Measure async operation
const data = await performanceService.measureAsync(
  'fetch-coins',
  () => fetchTopCoins(),
  'api'
);

// Get performance stats
const stats = performanceService.getStats();
console.log(`Average API time: ${stats.averageApiTime}ms`);
console.log(`Cache hit rate: ${stats.cacheHitRate}%`);

// Log performance report
performanceService.logReport();
```

**Features:**
- ✅ Track API response times
- ✅ Monitor render performance
- ✅ Cache hit rate tracking
- ✅ Identify slow operations
- ✅ Performance reports

---

### 2. Notification Service

Display in-app notifications:

```typescript
import { notificationService } from './services/notificationService';

// Success notification (auto-dismiss after 3s)
notificationService.success('Trade Executed', 'Bought 0.5 BTC');

// Error notification (auto-dismiss after 5s)
notificationService.error('Trade Failed', 'Insufficient balance');

// Warning notification
notificationService.warning('High Volatility', 'Market is very volatile');

// Info notification
notificationService.info('Update Available', 'New features released');

// Notification with action
notificationService.withAction(
  'warning',
  'Confirm Trade',
  'Are you sure you want to sell?',
  'Confirm',
  () => executeTrade(),
  0 // Manual dismiss
);

// Get all notifications
const notifications = notificationService.getAll();

// Clear all
notificationService.clearAll();
```

**Features:**
- ✅ Multiple notification types
- ✅ Auto-dismiss with duration
- ✅ Action buttons
- ✅ Notification history
- ✅ Subscribe to changes

---

### 3. Advanced Storage Service

Manage localStorage with versioning:

```typescript
import { storageService } from './services/storageService';

// Set item
storageService.setItem('user-profile', userData);

// Get item
const profile = storageService.getItem('user-profile');

// Check if exists
if (storageService.hasItem('user-profile')) {
  // ...
}

// Get all keys
const keys = storageService.getAllKeys();

// Get storage usage
const usage = storageService.getUsage();
console.log(`Used: ${usage.percentage.toFixed(1)}%`);

// Export all data
const backup = storageService.exportData();

// Import data
storageService.importData(backup);

// Backup to JSON
const json = storageService.backup();

// Restore from backup
storageService.restore(json);

// Log storage stats
storageService.logStats();

// Clear all
storageService.clearAll();
```

**Features:**
- ✅ Versioning support
- ✅ Storage usage tracking
- ✅ Data export/import
- ✅ Backup/restore
- ✅ Automatic cleanup

---

## 📊 Performance Optimization Tips

### 1. API Caching
```typescript
// Coins cached for 5 minutes
const coins = await fetchTopCoins();

// News cached for 10 minutes
const news = await fetchCryptoNews();

// Check cache hit rate
const stats = performanceService.getStats();
console.log(`Cache hit rate: ${stats.cacheHitRate}%`);
```

### 2. Lazy Loading
```typescript
// Components load on demand
const Academy = lazy(() => import('./components/Academy'));
const Signals = lazy(() => import('./components/Signals'));

// Suspense boundary
<Suspense fallback={<LoadingSpinner />}>
  <Academy />
</Suspense>
```

### 3. Code Splitting
```typescript
// Automatic with Vite
// React vendor: ~140KB
// UI vendor: ~390KB
// AI vendor: ~22KB
// App code: ~125KB
```

### 4. Image Optimization
```typescript
// Use WebP with fallback
<img 
  src="coin.webp" 
  alt="Bitcoin"
  loading="lazy"
/>
```

---

## 🔔 Notification Examples

### Trade Notifications
```typescript
// Buy successful
notificationService.success(
  'Buy Order Executed',
  'Purchased 0.5 BTC at $64,230'
);

// Sell failed
notificationService.error(
  'Sell Order Failed',
  'Insufficient balance for this trade'
);
```

### Price Alert Notifications
```typescript
// Price reached target
notificationService.info(
  'Price Alert',
  'Bitcoin reached your target price of $65,000'
);
```

### System Notifications
```typescript
// API unavailable
notificationService.warning(
  'API Unavailable',
  'Using cached data - live prices unavailable'
);

// Data synced
notificationService.success(
  'Data Synced',
  'Your portfolio has been updated'
);
```

---

## 💾 Storage Examples

### Save User Profile
```typescript
const profile = {
  id: 'user_123',
  name: 'John Doe',
  email: 'john@example.com',
  balance: 100000,
  preferences: {
    theme: 'dark',
    notifications: true
  }
};

storageService.setItem('profile', profile);
```

### Save Trading History
```typescript
const trades = [
  { id: 1, type: 'BUY', coin: 'BTC', amount: 0.5, price: 64230 },
  { id: 2, type: 'SELL', coin: 'ETH', amount: 2, price: 3450 }
];

storageService.setItem('trades', trades);
```

### Backup and Restore
```typescript
// Create backup
const backup = storageService.backup();
console.log(backup); // JSON string

// Save to file
const blob = new Blob([backup], { type: 'application/json' });
const url = URL.createObjectURL(blob);
// Download file...

// Restore from backup
storageService.restore(backup);
```

---

## 📈 Monitoring Dashboard

### Check Performance
```typescript
// In browser console
performanceService.logReport();

// Output:
// 📊 Performance Report
// Total Metrics: 45
// Average API Time: 250ms
// Average Render Time: 15ms
// Cache Hit Rate: 85%
// Slowest: fetch-coins (1250ms)
// Fastest: get-cache (2ms)
```

### Check Storage
```typescript
// In browser console
storageService.logStats();

// Output:
// 💾 Storage Statistics
// Items: 12
// Used: 245.50KB / 5.00MB
// Usage: 4.9%
// Keys: [profile, trades, watchlist, ...]
```

### Check Health
```typescript
// In browser console
await healthService.logHealthStatus();

// Output:
// 🏥 App Health Status
// Status: HEALTHY
// APIs: { coingecko: true, cryptocompare: true, gemini: true }
// Load Time: 1250ms
// Memory Usage: 45.23MB
```

---

## 🎯 Best Practices

### 1. Error Handling
```typescript
try {
  const data = await fetchTopCoins();
  notificationService.success('Data Loaded', 'Coins updated');
} catch (error) {
  notificationService.error('Load Failed', 'Using cached data');
  console.error('Fetch error:', error);
}
```

### 2. Performance Monitoring
```typescript
// Measure important operations
const result = await performanceService.measureAsync(
  'critical-operation',
  async () => {
    // Your code here
  },
  'api'
);

// Check if slow
const stats = performanceService.getStats();
if (stats.averageApiTime > 1000) {
  notificationService.warning('Slow API', 'Responses are slow');
}
```

### 3. Storage Management
```typescript
// Check storage before saving
const usage = storageService.getUsage();
if (usage.percentage > 80) {
  notificationService.warning('Storage Full', 'Clearing old data');
  // Clear old data
}

// Save important data
storageService.setItem('critical-data', data);
```

### 4. Notification Management
```typescript
// Subscribe to notifications
const unsubscribe = notificationService.subscribe((notifications) => {
  console.log('Notifications updated:', notifications);
});

// Unsubscribe when done
unsubscribe();
```

---

## 🔧 Configuration

### Performance Thresholds
```typescript
// Slow operation threshold: 1000ms
// Cache hit rate target: > 80%
// Storage usage limit: 5MB
// Max notifications: 10
```

### Storage Limits
```typescript
// Max storage size: 5MB
// Max items: Unlimited
// Version: 1
// Auto-cleanup: Disabled
```

---

## 📊 Metrics to Monitor

### API Performance
- Average response time
- Cache hit rate
- Failed requests
- Timeout count

### User Experience
- Page load time
- Render time
- Interaction latency
- Error frequency

### Storage
- Used space
- Item count
- Backup size
- Restore time

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Service Worker for offline support
- [ ] IndexedDB for larger storage
- [ ] Real-time sync with backend
- [ ] Advanced analytics dashboard
- [ ] Performance profiling tools
- [ ] Automated backups
- [ ] Data compression
- [ ] Encryption support

---

## 📞 Debugging

### Enable Debug Mode
```typescript
// In browser console
localStorage.setItem('nexus_debug', 'true');
location.reload();
```

### View All Logs
```typescript
// Performance logs
performanceService.getStats();

// Error logs
errorService.getLogs();

// Storage logs
storageService.logStats();

// Health logs
await healthService.logHealthStatus();
```

### Clear Everything
```typescript
// Clear storage
storageService.clearAll();

// Clear metrics
performanceService.clearMetrics();

// Clear notifications
notificationService.clearAll();

// Clear error logs
errorService.clearLogs();
```

---

## 💡 Tips & Tricks

### Monitor in Real-time
```typescript
// Set up interval to log stats
setInterval(() => {
  performanceService.logReport();
  storageService.logStats();
}, 60000); // Every minute
```

### Export Data for Analysis
```typescript
// Export all data
const data = storageService.exportData();

// Convert to CSV
const csv = Object.entries(data)
  .map(([key, value]) => `${key},${JSON.stringify(value)}`)
  .join('\n');

// Download
const blob = new Blob([csv], { type: 'text/csv' });
```

### Performance Optimization
```typescript
// Identify slow operations
const stats = performanceService.getStats();
const slow = performanceService.getMetricsByCategory('api')
  .filter(m => m.duration > 1000);

console.log('Slow operations:', slow);
```

---

**Your app now has enterprise-grade monitoring and management!** 🚀
