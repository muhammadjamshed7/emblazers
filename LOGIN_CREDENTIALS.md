# 🔑 LOGIN CREDENTIALS

## 📋 **All Module Logins**

All modules use the same password: `12345678`

---

## 🎯 **Quick Reference:**

**Pattern:** `{module}@emblazers.com` / `12345678`

---

## 📝 **Complete List:**

| # | Module | Email | Password |
|---|--------|-------|----------|
| 1 | **Student** | `student@emblazers.com` | `12345678` |
| 2 | **HR/Staff** | `hr@emblazers.com` | `12345678` |
| 3 | **Fee** | `fee@emblazers.com` | `12345678` |
| 4 | **Payroll** | `payroll@emblazers.com` | `12345678` |
| 5 | **Finance** | `finance@emblazers.com` | `12345678` |
| 6 | **Attendance** | `attendance@emblazers.com` | `12345678` |
| 7 | **Timetable** | `timetable@emblazers.com` | `12345678` |
| 8 | **Date Sheet** | `datesheet@emblazers.com` | `12345678` |
| 9 | **Curriculum** | `curriculum@emblazers.com` | `12345678` |
| 10 | **POS** | `pos@emblazers.com` | `12345678` |
| 11 | **Library** | `library@emblazers.com` | `12345678` |
| 12 | **Transport** | `transport@emblazers.com` | `12345678` |
| 13 | **Hostel** | `hostel@emblazers.com` | `12345678` |

---

## 🚀 **How to Login:**

### **Step 1: Open Application**
```
http://localhost:3000
```

### **Step 2: Select Module**
Click on any module card (e.g., "Student Module")

### **Step 3: Enter Credentials**
```
Email: student@emblazers.com
Password: 12345678
```

### **Step 4: Click "Login"**
You'll be redirected to the module dashboard

---

## 📊 **Access Matrix:**

| Module | Can Access | Purpose |
|--------|-----------|---------|
| **Student** | Student records, admissions, profiles | Student management |
| **HR** | Staff records, vacancies, applications | Staff management |
| **Fee** | Fee vouchers, structures, payments | Financial + Fee management |
| **Payroll** | Staff payrolls, salaries | Payroll processing |
| **Finance** | Accounts, ledgers, expenses, vendors | Financial management |
| **Attendance** | Student & staff attendance | Attendance tracking |
| **Timetable** | Class schedules, periods | Schedule management |
| **Date Sheet** | Exam schedules, dates | Exam scheduling |
| **Curriculum** | Subjects, syllabus, content | Curriculum management |
| **POS** | Items, sales, inventory | Point of sale |
| **Library** | Books, members, issues | Library management |
| **Transport** | Routes, vehicles, drivers | Transport management |
| **Hostel** | Rooms, residents, fees | Hostel management |

---

## 🔒 **Security Notes:**

### **Default Credentials:**
- All modules use default credentials for initial setup
- Password: `12345678` (same for all modules)

### **Change Password:**
1. Login to any module
2. Click "Change Password" in sidebar
3. Enter current password: `12345678`
4. Enter new password
5. Confirm new password
6. Click "Change Password"

### **After Password Change:**
- New password is hashed and stored in MongoDB
- Old default password won't work anymore
- Use new password for future logins

---

## 📝 **Session Information:**

### **Session Duration:**
- **30 days** (permanent sessions)
- No automatic logout
- Only logout when you click "Logout" button

### **Session Persistence:**
- ✅ Survives page refresh
- ✅ Survives browser restart
- ✅ Shared across multiple tabs
- ✅ Stored securely in localStorage

---

## 🎯 **Quick Start Examples:**

### **Example 1: Student Management**
```
1. Go to: http://localhost:3000
2. Click "Student Module"
3. Login: student@emblazers.com / 12345678
4. Add students, view records, manage admissions
```

### **Example 2: Attendance Marking**
```
1. Go to: http://localhost:3000
2. Click "Attendance Module"
3. Login: attendance@emblazers.com / 12345678
4. Select class & section
5. Mark Present/Absent for each student
6. Save attendance
```

### **Example 3: Fee Management**
```
1. Go to: http://localhost:3000
2. Click "Fee Module"
3. Login: fee@emblazers.com / 12345678
4. Create fee structures, generate vouchers, record payments
```

---

## 🔍 **Troubleshooting:**

### **Issue: "Invalid credentials"**
**Solutions:**
- Make sure email is exactly: `{module}@emblazers.com`
- Password is case-sensitive: `12345678`
- No spaces before or after email/password
- Try copying credentials from this document

### **Issue: "Already logged into another module"**
**This is normal!** Each module has its own separate session:
- Student session is independent of HR session
- You can be logged into multiple modules in different tabs
- Just use the correct login for each module

### **Issue: "Session expired"**
**This shouldn't happen** (sessions are permanent now):
- Clear browser cache and localStorage
- Try logging in again
- Check if MongoDB is running

---

## ✅ **Verification:**

### **Test All Logins:**

```bash
# Test Student Login
Open: http://localhost:3000/student/login
Email: student@emblazers.com
Password: 12345678
Expected: ✅ Dashboard loads

# Test Attendance Login
Open: http://localhost:3000/attendance/login
Email: attendance@emblazers.com
Password: 12345678
Expected: ✅ Dashboard loads

# Test Fee Login
Open: http://localhost:3000/fee/login
Email: fee@emblazers.com
Password: 12345678
Expected: ✅ Dashboard loads

... (repeat for all 13 modules)
```

---

## 📖 **Additional Information:**

### **Role:**
All default logins have `admin` role with full permissions:
- Create, Read, Update, Delete (CRUD)
- Access to all module features
- Full control over module data

### **Module Names:**
If you need the exact module ID for code:
```typescript
"student" | "hr" | "fee" | "payroll" | "finance" | 
"attendance" | "timetable" | "datesheet" | "curriculum" | 
"pos" | "library" | "transport" | "hostel"
```

---

## 🎉 **Summary:**

**✅ All 13 modules accessible**
**✅ Same password for all: `12345678`**
**✅ Pattern: `{module}@emblazers.com`**
**✅ Permanent sessions (30 days)**
**✅ Full admin access**

**Just open http://localhost:3000 and login to any module!** 🚀

---

## 🔗 **Quick Access Links:**

| Module | Direct Login URL |
|--------|------------------|
| Student | `http://localhost:3000/student/login` |
| HR | `http://localhost:3000/hr/login` |
| Fee | `http://localhost:3000/fee/login` |
| Payroll | `http://localhost:3000/payroll/login` |
| Finance | `http://localhost:3000/finance/login` |
| Attendance | `http://localhost:3000/attendance/login` |
| Timetable | `http://localhost:3000/timetable/login` |
| Date Sheet | `http://localhost:3000/datesheet/login` |
| Curriculum | `http://localhost:3000/curriculum/login` |
| POS | `http://localhost:3000/pos/login` |
| Library | `http://localhost:3000/library/login` |
| Transport | `http://localhost:3000/transport/login` |
| Hostel | `http://localhost:3000/hostel/login` |

---

**All logins ready to use!** ✅
