# Vercel Deployment Guide

## Environment Variables Setup

Make sure to set these environment variables in your Vercel project settings:

### Required Variables:
1. **DATABASE_URL** or **MONGODB_URI**
   - Your MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/tinylink`
   - Make sure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs) for Vercel

2. **NEXT_PUBLIC_BASE_URL**
   - Your Vercel deployment URL
   - Format: `https://your-app.vercel.app`
   - This is used to generate short link URLs

### Optional Variables:
3. **MONGODB_DB**
   - Database name (defaults to 'tinylink' if not set)

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is fine)
3. Create a database user with read/write permissions
4. Whitelist IP addresses:
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allows all IPs - required for Vercel)
5. Get your connection string:
   - Go to Database → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Add database name at the end: `mongodb+srv://user:pass@cluster.mongodb.net/tinylink`

## Common Issues and Solutions

### Issue: Data not saving or updating
**Solution**: 
- Check that DATABASE_URL is set correctly in Vercel environment variables
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check Vercel function logs for connection errors

### Issue: Connection timeouts
**Solution**:
- The updated connection code includes proper timeout settings
- Make sure your MongoDB Atlas cluster is running
- Check network connectivity

### Issue: Clicks not updating
**Solution**:
- The database connection is now optimized for serverless
- Operations are properly awaited
- Check Vercel logs to see if updates are completing

## Testing After Deployment

1. Test health endpoint: `https://your-app.vercel.app/healthz`
2. Create a link via the dashboard
3. Click the short link and verify redirect works
4. Check dashboard to see if click count updated
5. Delete a link and verify it returns 404

## Monitoring

Check Vercel function logs:
1. Go to your Vercel project
2. Click on "Functions" tab
3. View logs for each API route
4. Look for any MongoDB connection errors

## Database Connection Pattern

The code uses a serverless-optimized connection pattern:
- Connection pooling for efficiency
- Proper timeout handling
- Error recovery and reconnection
- Works with Vercel's serverless functions

