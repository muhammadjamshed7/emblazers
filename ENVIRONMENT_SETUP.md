# 🔐 Environment Setup Guide

This guide will help you set up the environment variables for the Emblazers School Management System.

## 📋 Quick Start

### For Local Development:

1. **Copy the local environment file:**
   ```bash
   # Use .env.local for quick development setup
   cp .env.local .env
   ```

2. **Update MongoDB Connection:**
   Open `.env` and replace the MongoDB URI with your actual connection string.

3. **Get MongoDB Atlas (Free):**
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account
   - Create a new cluster (Free tier available)
   - Create a database user
   - Get your connection string
   - Replace `<password>` with your actual password

4. **Start the application:**
   ```bash
   npm install
   npm run dev
   ```

---

## 🗂️ Environment Files Overview

| File | Purpose | Committed to Git? |
|------|---------|-------------------|
| `.env` | **Active configuration** (used by the app) | ❌ No |
| `.env.example` | **Template** with instructions | ✅ Yes |
| `.env.local` | **Quick local development** setup | ❌ No |
| `.env.production` | **Production** configuration template | ❌ No |

---

## 🔑 Required Environment Variables

### 1. **MONGO_URI** (Required)
Your MongoDB connection string.

**Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/database
```

**Example:**
```env
MONGO_URI=mongodb+srv://emblazers:mypassword123@cluster0.abc123.mongodb.net/emblazers?retryWrites=true&w=majority
```

**How to get it:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

---

### 2. **JWT_SECRET** (Required)
Secret key for JSON Web Token authentication.

**Generate a secure key:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Example:**
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

⚠️ **IMPORTANT:** 
- Use a unique secret for each environment
- Never share your JWT secret
- Minimum 32 characters recommended

---

### 3. **NODE_ENV** (Optional)
Application environment mode.

**Values:**
- `development` - Local development (default)
- `production` - Production deployment

**Example:**
```env
NODE_ENV=development
```

---

### 4. **PORT** (Optional)
Server port number. Defaults to `5000`.

**Example:**
```env
PORT=5000
```

---

### 5. **CLIENT_URL** (Optional)
Frontend URL for CORS configuration.

**Development:**
```env
CLIENT_URL=http://localhost:5000
```

**Production:**
```env
CLIENT_URL=https://yourdomain.com
```

---

## 📝 Step-by-Step Setup

### Option 1: Use Local Development Template
```bash
# Copy the local template
cp .env.local .env

# Edit the file
# Replace MONGO_URI with your actual MongoDB connection string
# Replace JWT_SECRET with a secure random string
```

### Option 2: Use Example Template
```bash
# Copy the example template
cp .env.example .env

# Edit and fill in all values
```

### Option 3: Create from Scratch
```bash
# Create new .env file
touch .env
```

Then add:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
CLIENT_URL=http://localhost:5000
```

---

## 🧪 Testing Your Setup

1. **Check MongoDB Connection:**
   ```bash
   # Start the server
   npm run dev
   
   # Look for: "MongoDB connected successfully"
   ```

2. **Test Health Endpoint:**
   ```bash
   curl http://localhost:5000/api/health
   ```

   Should return:
   ```json
   {"ok": true, "db": true}
   ```

3. **Test Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "student@emblazers.com",
       "password": "12345678",
       "module": "student"
     }'
   ```

---

## 🚀 Production Deployment

### For Vercel/Netlify/Railway:

Add environment variables in your hosting dashboard:

```env
NODE_ENV=production
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://yourdomain.com
```

### For Docker:

Create `.env.production` and use:
```bash
docker run --env-file .env.production your-image
```

### For Traditional Hosting:

1. Copy `.env.production` to server
2. Rename to `.env`
3. Update all values
4. Restart application

---

## 🔒 Security Best Practices

✅ **DO:**
- Use different JWT secrets for dev/production
- Use strong, random passwords
- Restrict MongoDB IP access
- Enable MongoDB authentication
- Use environment variables for all secrets
- Regularly rotate secrets

❌ **DON'T:**
- Commit `.env` files to Git
- Share `.env` files publicly
- Use simple/predictable secrets
- Reuse secrets across projects
- Hardcode secrets in code

---

## 🆘 Troubleshooting

### "MONGO_URI environment variable is not set"
- Check if `.env` file exists
- Ensure `MONGO_URI` is spelled correctly
- Restart the server after changing `.env`

### "JWT_SECRET environment variable is not set"
- Add `JWT_SECRET` to your `.env` file
- Use a secure random string (min 32 chars)

### "MongoDB connection error"
- Verify your MongoDB URI is correct
- Check if password has special characters (URL encode them)
- Ensure IP is whitelisted in MongoDB Atlas
- Check network connectivity

### Server won't start
- Check all required variables are set
- Look for syntax errors in `.env`
- Ensure no extra spaces around `=`
- Try: `npm run dev` with verbose logging

---

## 📚 Module Login Credentials

All modules use the format: `{module}@emblazers.com` / `12345678`

| Module | Email | Password |
|--------|-------|----------|
| Student | `student@emblazers.com` | `12345678` |
| HR | `hr@emblazers.com` | `12345678` |
| Fee | `fee@emblazers.com` | `12345678` |
| Payroll | `payroll@emblazers.com` | `12345678` |
| Finance | `finance@emblazers.com` | `12345678` |
| Attendance | `attendance@emblazers.com` | `12345678` |
| Timetable | `timetable@emblazers.com` | `12345678` |
| Date Sheet | `datesheet@emblazers.com` | `12345678` |
| Curriculum | `curriculum@emblazers.com` | `12345678` |
| POS | `pos@emblazers.com` | `12345678` |
| Library | `library@emblazers.com` | `12345678` |
| Transport | `transport@emblazers.com` | `12345678` |
| Hostel | `hostel@emblazers.com` | `12345678` |

---

## 🔗 Helpful Links

- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [Environment Variables Best Practices](https://12factor.net/config)
- [JWT Authentication Guide](https://jwt.io/introduction)

---

## 💬 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check the server logs for error messages
4. Ensure MongoDB Atlas network access is configured

---

**Created for:** Emblazers School Management System  
**Last Updated:** January 2026
