# Deployment Checklist - NexusCrypto

Use this checklist before deploying to production.

## Pre-Deployment

- [ ] All tests passing: `npm run test:run`
- [ ] No linting errors: `npm run lint`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`
- [ ] Production build works locally: `npm run preview`
- [ ] All environment variables documented
- [ ] API keys obtained and tested locally
- [ ] No console errors in browser (F12)
- [ ] No sensitive data in code
- [ ] Git history is clean

## Vercel Deployment

### Step 1: Prepare Repository
- [ ] Push all changes to GitHub
- [ ] Create `.env.production` file (already done)
- [ ] Verify `.gitignore` excludes `.env.local`
- [ ] Tag release version: `git tag v1.0.0`

### Step 2: Configure Vercel
- [ ] Connect GitHub repo to Vercel
- [ ] Set project name
- [ ] Select root directory (if monorepo)
- [ ] Verify build command: `npm run build`
- [ ] Verify output directory: `dist`

### Step 3: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```
VITE_COINGECKO_API_KEY=your-key
VITE_CRYPTOCOMPARE_API_KEY=your-key
VITE_GEMINI_API_KEY=your-key
```

- [ ] All variables added
- [ ] Variables set for Production environment
- [ ] Variables set for Preview environment (optional)

### Step 4: Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors
- [ ] Verify deployment URL works
- [ ] Test all features on deployed version

### Step 5: Post-Deployment
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Check performance metrics
- [ ] Verify API calls working
- [ ] Check error logging
- [ ] Monitor for errors (24 hours)

## Performance Checks

- [ ] Lighthouse score > 80
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3.5s

## Security Checks

- [ ] No API keys in code
- [ ] No sensitive data in localStorage
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Input validation working
- [ ] Error messages don't leak info

## Functionality Tests

### Dashboard
- [ ] Coins load correctly
- [ ] News feed displays
- [ ] Portfolio summary shows
- [ ] Navigation works

### Market Analysis
- [ ] Charts render
- [ ] Price data updates
- [ ] Buy/Sell buttons work
- [ ] Watchlist functions

### Trading
- [ ] Can execute trades
- [ ] Balance updates
- [ ] Positions tracked
- [ ] Transactions recorded

### Other Features
- [ ] Academy loads
- [ ] Signals display
- [ ] Profile works
- [ ] Settings accessible

## Monitoring Setup

- [ ] Error tracking enabled (Sentry, etc.)
- [ ] Analytics configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring enabled
- [ ] Alerts configured

## Rollback Plan

- [ ] Previous version tagged
- [ ] Rollback procedure documented
- [ ] Team knows how to rollback
- [ ] Backup of database (if applicable)

## Documentation

- [ ] README updated
- [ ] QUICK_START.md current
- [ ] VERCEL_DEPLOYMENT.md accurate
- [ ] API documentation complete
- [ ] Known issues documented

## Post-Launch

- [ ] Monitor error logs daily
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Plan next features
- [ ] Schedule maintenance window

---

## Troubleshooting During Deployment

### Build Fails
1. Check build logs in Vercel
2. Run `npm run build` locally
3. Check for TypeScript errors: `npx tsc --noEmit`
4. Clear cache: `rm -rf .next dist node_modules`

### App Stuck Loading
1. Check browser console (F12)
2. Check network tab for failed requests
3. Verify environment variables set
4. Check Vercel logs
5. Try hard refresh (Ctrl+Shift+R)

### API Calls Failing
1. Verify API keys in Vercel dashboard
2. Check API key validity
3. Check rate limits
4. Verify CORS settings
5. Check network connectivity

### Performance Issues
1. Check Lighthouse score
2. Review bundle size
3. Check for memory leaks
4. Monitor API response times
5. Check database queries

---

## Quick Commands

```bash
# Local testing
npm run build
npm run preview

# Check for errors
npx tsc --noEmit
npm run lint

# Run tests
npm run test:run

# View build size
npm run build -- --analyze

# Deploy to Vercel
vercel deploy --prod
```

---

## Support Contacts

- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: Create issue in repository
- **API Support**: Check respective API documentation

---

## Sign-Off

- [ ] QA approved
- [ ] Product owner approved
- [ ] Security review passed
- [ ] Performance acceptable
- [ ] Ready for production

**Deployed by:** ________________  
**Date:** ________________  
**Version:** ________________  

---

**Last Updated:** January 8, 2026
