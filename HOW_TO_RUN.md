# 🚀 HOW TO RUN FRONTEND + BACKEND

## ✅ **SIMPLE ANSWER:**

### **One Command Runs Both:**
```bash
npm run dev
```

This single command starts:
- ✅ **Backend** (Express API server)
- ✅ **Frontend** (React + Vite)
- ✅ **Accessible at:** http://localhost:5000

---

## 📋 **What Happens When You Run `npm run dev`:**

```
npm run dev
    ↓
Starts tsx server/index.ts
    ↓
Express Server Initializes
    ↓
Attempts MongoDB Connection
    ↓
Vite Middleware Attached (serves React app)
    ↓
Server Ready on Port 5000
    ↓
http://localhost:5000
```

---

## ⚠️ **CURRENT ISSUE: MongoDB Atlas DNS Timeout**

The server is trying to connect but **timing out** due to network/DNS issues.

### **Possible Causes:**
1. ❌ **Firewall** blocking MongoDB Atlas (`cluster0.555fqle.mongodb.net`)
2. ❌ **ISP restrictions**
3. ❌ **Windows Defender/Antivirus**
4. ❌ **VPN interference**
5. ❌ **DNS resolver issues**

---

## 🔧 **SOLUTIONS (Try in Order):**

###  **Solution 1: Check Windows Firewall**
```powershell
# Open Windows Firewall
# Allow Node.js through firewall
# Settings → Windows Security → Firewall & Network Protection
# → Allow an app through firewall → Node.js
```

### **Solution 2: Flush DNS Cache**
```powershell
ipconfig /flushdns
```

Then run:
```bash
npm run dev
```

### **Solution 3: Use Google DNS**
1. Open Network Settings
2. Change DNS to: `8.8.8.8` and `8.8.4.4`
3. Restart computer
4. Try again

### **Solution 4: Test MongoDB Connection Separately**
```powershell
# Test if you can reach MongoDB Atlas
ping cluster0.555fqle.mongodb.net

# Or use CMD:
nslookup cluster0.555fqle.mongodb.net
```

If this fails, it's a network/firewall issue.

### **Solution 5: Temporarily Disable Antivirus**
- Disable Windows Defender/Antivirus temporarily
- Run: `npm run dev`
- If it works, add Node.js to exceptions

### ** Solution 6: Wait 5-10 Minutes**
MongoDB Atlas IP whitelist changes can take up to **10 minutes** to fully propagate.

### **Solution 7: Verify MongoDB Atlas Settings**

1. Go to: https://cloud.mongodb.com/
2. **Network Access** → Check:
   ```
   IP Address: 0.0.0.0/0
   Status: Active ✅
   ```
3. **Database Access** → Check:
   ```
   User: jamshedmsd589_db_user
   Status: Active ✅
   ```
4. **Clusters** → Cluster0 → Status:
   ```
   Status: Active (green dot) ✅
   ```

### **Solution 8: Use Alternative MongoDB (Temporary)**

If MongoDB Atlas keeps failing, use **local MongoDB**:

**Option A: MongoDB Compass**
1. Download: https://www.mongodb.com/try/download/compass
2. Install
3. Will run local MongoDB automatically

Update `.env` line 37:
```env
MONGO_URI=mongodb://localhost:27017/emblazers
```

Run:
```bash
npm run dev
```

**Option B: Install MongoDB Community**
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Update `.env`:
```env
MONGO_URI=mongodb://localhost:27017/emblazers
```

---

## ✅ **SUCCESS LOOKS LIKE THIS:**

When MongoDB connects successfully:

```bash
> rest-express@1.0.0 dev
> tsx server/index.ts

✅ MongoDB connected successfully
✅ serving on port 5000
```

Then open browser:
```
http://localhost:5000
```

You'll see:
- ✅ Homepage with 13 modules
- ✅ Login interface
- ✅ Full application working!

---

## 🎯 **RECOMMENDED NEXT STEPS:**

1. **Try flushing DNS:**
   ```powershell
   ipconfig /flushdns
   ```

2. **Wait 10 minutes** after changing MongoDB Atlas IP whitelist

3. **Run again:**
   ```bash
   npm run dev
   ```

4. **If still fails, install local MongoDB Compass**

5. **Update `.env` to use local MongoDB**

6. **Run `npm run dev` again**

---

## 📞 **QUICK FIX: Use Local MongoDB Now**

If you want to test the app RIGHT NOW while troubleshooting MongoDB Atlas:

1. **Download MongoDB Compass:** https://www.mongodb.com/try/download/compass
2. **Install** (takes 2 minutes)
3. **Update `.env` line 37:**
   ```env
   MONGO_URI=mongodb://localhost:27017/emblazers
   ```
4. **Run:**
   ```bash
   npm run dev
   ```
5. **It will work immediately!** ✅

---

## 🌐 **Once Server Starts:**

**Access the app:**
```
http://localhost:5000
```

**Login credentials:**
```
Email: student@emblazers.com
Password: 12345678

(Works for all modules: student, hr, fee, etc.)
```

---

## 🎯 **SUMMARY:**

| Action | Command |
|--------|---------|
| **Run Frontend + Backend** | `npm run dev` |
| **Access App** | http://localhost:5000 |
| **Stop Server** | Press `Ctrl+C` |

**Current Issue:** MongoDB Atlas DNS timeout (network/firewall)

**Quick Fix:** Use local MongoDB Compass instead

---

**The command to run both frontend and backend is simply: `npm run dev`**

**The issue is MongoDB Atlas connection - not the application itself!**
