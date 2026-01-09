# NexusCrypto - Developer Tools & Debugging Guide

## 🛠️ Browser Console Commands

Open browser console with **F12** and use these commands:

### Performance Monitoring

```javascript
// Get performance stats
performanceService.logReport();

// Get specific metrics
const stats = performanceService.getStats();
console.table(stats);

// Get slow operations
const slow = performanceService.getMetricsByCategory('api')
  .filter(m => m.duration > 1000);
console.table(slow);

// Clear metrics
performanceService.clearMetrics();
```

### Error Tracking

```javascript
// Get all errors
const errors = errorService.getRecentErrors(10);
console.table(errors);

// Get errors by level
const warnings = errorService.getLogsByLevel('warn');
console.table(warnings);

// Get error count
console.log(`Errors: ${errorService.getErrorCount()}`);
console.log(`Warnings: ${errorService.getWarningCount()}`);

// Clear logs
errorService.clearLogs();
```

### Storage Management

```javascript
// Get storage stats
storageService.logStats();

// Get usage
const usage = storageService.getUsage();
console.table(usage);

// Get all keys
const keys = storageService.getAllKeys();
console.log(keys);

// Get specific item
const profile = storageService.getItem('profile');
console.log(profile);

// Export all data
const backup = storageService.exportData();
console.log(JSON.stringify(backup, null, 2));

// Clear storage
storageService.clearAll();
```

### Health Monitoring

```javascript
// Check app health
await healthService.logHealthStatus();

// Get last status
const status = healthService.getLastStatus();
console.table(status);
```

### Notifications

```javascript
// Get all notifications
const notifications = notificationService.getAll();
console.table(notifications);

// Show test notification
notificationService.success('Test', 'This is a test notification');

// Clear all
notificationService.clearAll();
```

---

## 🔍 Debugging Techniques

### 1. Enable Debug Mode

```javascript
// In browser console
localStorage.setItem('nexus_debug', 'true');
location.reload();

// Disable
localStorage.removeItem('nexus_debug');
```

### 2. Monitor API Calls

```javascript
// In browser console
// Open Network tab (F12 → Network)
// Filter by XHR/Fetch
// Watch for:
// - coingecko.com (coin data)
// - cryptocompare.com (news)
// - generativelanguage.googleapis.com (AI)
```

### 3. Check Cache Status

```javascript
// In browser console
const cached = cacheService.get('top-coins');
console.log('Cached coins:', cached);

// Check cache TTL
const cacheStats = cacheService.getStats();
console.table(cacheStats);
```

### 4. Monitor State Changes

```javascript
// In browser console
// Open React DevTools (Chrome extension)
// Inspect component state
// Watch for:
// - coins state
// - user state
// - isLoadingData state
// - loadError state
```

### 5. Test Error Handling

```javascript
// Simulate API failure
localStorage.setItem('nexus_force_error', 'true');
location.reload();

// Disable
localStorage.removeItem('nexus_force_error');
```

---

## 📊 Performance Profiling

### 1. Lighthouse Audit

```bash
# In Chrome DevTools
# F12 → Lighthouse
# Click "Analyze page load"
# Check:
# - Performance score
# - Accessibility score
# - Best practices score
# - SEO score
```

### 2. Performance Timeline

```javascript
// In browser console
// F12 → Performance tab
// Click record
// Interact with app
// Click stop
// Analyze timeline for:
// - Long tasks
// - Rendering bottlenecks
// - Memory leaks
```

### 3. Memory Profiling

```javascript
// In browser console
// F12 → Memory tab
// Take heap snapshot
// Compare snapshots to find leaks
// Look for:
// - Growing memory usage
// - Detached DOM nodes
// - Unreleased listeners
```

---

## 🐛 Common Issues & Solutions

### Issue: App Stuck Loading

**Debug Steps:**
```javascript
// 1. Check if data is loading
console.log('isLoadingData:', isLoadingData);

// 2. Check for errors
errorService.logReport();

// 3. Check API status
await healthService.logHealthStatus();

// 4. Check cache
const cached = cacheService.get('top-coins');
console.log('Cached data:', cached);

// 5. Check network
// F12 → Network tab → Look for failed requests
```

**Solutions:**
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+Shift+R
- Clear localStorage: `storageService.clearAll()`
- Check API keys in `.env.local`

### Issue: High Memory Usage

**Debug Steps:**
```javascript
// 1. Check performance
performanceService.logReport();

// 2. Check storage
storageService.logStats();

// 3. Take heap snapshot
// F12 → Memory → Take snapshot

// 4. Look for leaks
// Compare multiple snapshots
```

**Solutions:**
- Clear old metrics: `performanceService.clearMetrics()`
- Clear storage: `storageService.clearAll()`
- Restart app: `location.reload()`

### Issue: Slow API Calls

**Debug Steps:**
```javascript
// 1. Check API times
const slow = performanceService.getMetricsByCategory('api')
  .filter(m => m.duration > 1000);
console.table(slow);

// 2. Check cache hit rate
const stats = performanceService.getStats();
console.log(`Cache hit rate: ${stats.cacheHitRate}%`);

// 3. Check network
// F12 → Network → Look for slow requests
```

**Solutions:**
- Add API keys for better rate limits
- Check internet connection
- Try different API endpoint
- Use cached data

---

## 🧪 Testing Commands

### Test All Services

```javascript
// Test performance service
performanceService.recordMetric('test', 100, 'api');
performanceService.logReport();

// Test notification service
notificationService.success('Test', 'Success notification');
notificationService.error('Test', 'Error notification');
notificationService.warning('Test', 'Warning notification');
notificationService.info('Test', 'Info notification');

// Test storage service
storageService.setItem('test', { data: 'test' });
const retrieved = storageService.getItem('test');
console.log('Storage test:', retrieved);

// Test error service
errorService.logError('Test error', new Error('Test'));
errorService.logWarning('Test warning');
errorService.logInfo('Test info');

// Test health service
await healthService.logHealthStatus();
```

### Test Data Loading

```javascript
// Force reload data
const coins = await fetchTopCoins();
console.log('Coins:', coins);

const news = await fetchCryptoNews();
console.log('News:', news);

// Check cache
const cachedCoins = cacheService.get('top-coins');
console.log('Cached coins:', cachedCoins);
```

### Test Trading

```javascript
// Simulate trade
const user = authService.getCurrentUser();
console.log('Current user:', user);

// Check balance
console.log('Balance:', user?.balance);

// Check positions
console.log('Positions:', user?.positions);

// Check transactions
console.log('Transactions:', user?.transactions);
```

---

## 📈 Monitoring Dashboard

Create a custom monitoring dashboard:

```javascript
// In browser console
setInterval(() => {
  console.clear();
  console.log('=== NexusCrypto Monitoring Dashboard ===');
  
  // Performance
  const perfStats = performanceService.getStats();
  console.log('📊 Performance:');
  console.log(`  API Time: ${perfStats.averageApiTime}ms`);
  console.log(`  Cache Hit: ${perfStats.cacheHitRate}%`);
  
  // Storage
  const storage = storageService.getUsage();
  console.log('💾 Storage:');
  console.log(`  Used: ${(storage.used / 1024).toFixed(2)}KB`);
  console.log(`  Usage: ${storage.percentage.toFixed(1)}%`);
  
  // Errors
  console.log('❌ Errors:');
  console.log(`  Count: ${errorService.getErrorCount()}`);
  console.log(`  Warnings: ${errorService.getWarningCount()}`);
  
  // Notifications
  const notifs = notificationService.getAll();
  console.log('🔔 Notifications:');
  console.log(`  Count: ${notifs.length}`);
  
}, 5000); // Update every 5 seconds
```

---

## 🔧 Advanced Debugging

### 1. Network Throttling

```javascript
// Simulate slow network
// F12 → Network tab → Throttling dropdown
// Select: Slow 3G, Fast 3G, 4G, etc.
```

### 2. CPU Throttling

```javascript
// Simulate slow CPU
// F12 → Performance tab → Settings
// CPU throttling: 4x, 6x, etc.
```

### 3. Offline Mode

```javascript
// Test offline functionality
// F12 → Network tab → Offline checkbox
// App should use cached data
```

### 4. Device Emulation

```javascript
// Test on different devices
// F12 → Device toolbar (Ctrl+Shift+M)
// Select device: iPhone, iPad, Android, etc.
```

---

## 📝 Logging Best Practices

### Good Logging

```javascript
// ✅ Good
console.log('✅ Fetched 15 coins');
console.warn('⚠️ API timeout - using cache');
console.error('❌ Trade failed:', error);

// ✅ With context
console.log('📊 Performance:', {
  apiTime: 250,
  cacheHit: true,
  duration: 1250
});
```

### Bad Logging

```javascript
// ❌ Bad
console.log('data');
console.log(data);
console.log('error');

// ❌ Too verbose
console.log('The data has been fetched from the API and is now available');
```

---

## 🚀 Performance Optimization Checklist

- [ ] Cache hit rate > 80%
- [ ] Average API time < 500ms
- [ ] Average render time < 50ms
- [ ] Storage usage < 50%
- [ ] No memory leaks
- [ ] No slow operations
- [ ] Lighthouse score > 80
- [ ] No console errors

---

## 📞 Quick Reference

| Command | Purpose |
|---------|---------|
| `performanceService.logReport()` | Show performance stats |
| `errorService.getRecentErrors()` | Show recent errors |
| `storageService.logStats()` | Show storage usage |
| `await healthService.logHealthStatus()` | Check app health |
| `notificationService.getAll()` | Show notifications |
| `cacheService.getStats()` | Show cache stats |

---

## 💡 Pro Tips

1. **Use React DevTools** - Install Chrome extension for better debugging
2. **Monitor in Production** - Use Sentry or similar for error tracking
3. **Profile Regularly** - Check performance metrics weekly
4. **Clean Up** - Clear old logs and cache periodically
5. **Test Offline** - Ensure app works without internet
6. **Check Mobile** - Test on actual mobile devices
7. **Monitor Memory** - Watch for memory leaks
8. **Log Errors** - Always log errors for debugging

---

**Happy Debugging!** 🐛
