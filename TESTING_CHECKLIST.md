# ✅ SESSION MANAGEMENT TEST CHECKLIST

## 🧪 **Complete Testing Guide**

Follow these tests to verify the authentication system works correctly.

---

## ✅ **Test 1: Basic Login & Logout**

### **Steps:**
1. Navigate to: http://localhost:3000
2. Click "Student Module"
3. Enter credentials:
   - Email: `student@emblazers.com`
   - Password: `12345678`
4. Click "Login"

### **Expected Results:**
- ✅ Redirected to `/student/dashboard`
- ✅ Sidebar shows "Student Admin"
- ✅ Dashboard loads successfully
- ✅ No errors in browser console

### **Test Logout:**
5. Click "Logout" button in sidebar
6. **Expected:** Redirected to homepage (/)
7. **Expected:** localStorage cleared (check DevTools → Application → Local Storage)

---

## ✅ **Test 2: Session Persistence (Page Refresh)**

### **Steps:**
1. Login to Student Module
2. Navigate to `/student/list`
3. Press **F5** or click refresh button
4. Wait for page to reload

### **Expected Results:**
- ✅ User stays logged in
- ✅ Still on `/student/list` page
- ✅ No redirect to login
- ✅ Data loads correctly
- ✅ Sidebar still shows logged-in state

### **Verification:**
- Open DevTools → Application → Local Storage
- Check `emblazers_token` still exists
- Check `emblazers_session` still exists

---

## ✅ **Test 3: Session Persistence (Browser Restart)**

### **Steps:**
1. Login to any module
2. **Close browser completely** (not just tab)
3. Wait 5 seconds
4. Reopen browser
5. Navigate to: http://localhost:3000/student/dashboard

### **Expected Results:**
- ✅ User stays logged in
- ✅ Dashboard loads immediately
- ✅ No redirect to login page

---

## ✅ **Test 4: Multiple Tabs**

### **Steps:**
1. Login to Student Module in Tab 1
2. Open new tab (Tab 2)
3. Navigate to http://localhost:3000/student/dashboard in Tab 2

### **Expected Results:**
- ✅ Both tabs show logged-in state
- ✅ Both tabs share same session
- ✅ Can navigate in both tabs without re-login

### **Test Logout Sync:**
4. In Tab 1: Click "Logout"
5. Switch to Tab 2
6. Try to navigate to any student page
7. **Expected:** Tab 2 also requires login (session cleared)

---

## ✅ **Test 5: Wrong Module Access**

### **Steps:**
1. Login to Student Module
2. In address bar, type: http://localhost:3000/hr/dashboard
3. Press Enter

### **Expected Results:**
- ✅ Redirected to `/hr/login`
- ✅ NOT logged into HR module
- ✅ Student session still valid (check by going back to student pages)

---

## ✅ **Test 6: Direct URL Access (Not Logged In)**

### **Steps:**
1. Open browser (not logged in)
2. Try to access: http://localhost:3000/student/dashboard

### **Expected Results:**
- ✅ Redirected to `/student/login`
- ✅ Login form displayed
- ✅ Cannot access protected routes without login

---

## ✅ **Test 7: Session Expiry Testing**

### **Manual Simulation (Using DevTools):**

1. Login to any module
2. Open DevTools → Application → Local Storage
3. Click on `emblazers_session`
4. Edit the JSON:
   ```json
   {
     ...existing data...,
     "expiresAt": 1000  // Set to a past timestamp
   }
   ```
5. Save the change
6. Refresh the page

### **Expected Results:**
- ✅ Redirected to login page
- ✅ Session cleared automatically
- ✅ localStorage cleaned up

---

## ✅ **Test 8: All Module Logins**

### **Test Each Module:**

| Module | Email | Password | Expected |
|--------|-------|----------|----------|
| Student | `student@emblazers.com` | `12345678` | ✅ Login success |
| HR | `hr@emblazers.com` | `12345678` | ✅ Login success |
| Fee | `fee@emblazers.com` | `12345678` | ✅ Login success |
| Payroll | `payroll@emblazers.com` | `12345678` | ✅ Login success |
| Finance | `finance@emblazers.com` | `12345678` | ✅ Login success |
| Attendance | `attendance@emblazers.com` | `12345678` | ✅ Login success |
| Timetable | `timetable@emblazers.com` | `12345678` | ✅ Login success |
| Date Sheet | `datesheet@emblazers.com` | `12345678` | ✅ Login success |
| Curriculum | `curriculum@emblazers.com` | `12345678` | ✅ Login success |
| POS | `pos@emblazers.com` | `12345678` | ✅ Login success |
| Library | `library@emblazers.com` | `12345678` | ✅ Login success |
| Transport | `transport@emblazers.com` | `12345678` | ✅ Login success |
| Hostel | `hostel@emblazers.com` | `12345678` | ✅ Login success |

### **For each module, verify:**
- ✅ Login works
- ✅ Dashboard loads
- ✅ Sidebar navigation works
- ✅ Page refresh keeps session
- ✅ Logout works

---

## ✅ **Test 9: Invalid Credentials**

### **Steps:**
1. Navigate to any module login
2. Enter wrong credentials:
   - Email: `wrong@emblazers.com`
   - Password: `wrongpassword`
3. Click "Login"

### **Expected Results:**
- ✅ Login fails
- ✅ Error message displayed
- ✅ Stays on login page
- ✅ No session created
- ✅ No token stored

---

## ✅ **Test 10: Token Validation**

### **Steps:**
1. Login to Student Module
2. Open DevTools → Application → Local Storage
3. Delete `emblazers_token` (keep session)
4. Try to navigate to any student page

### **Expected Results:**
- ✅ Redirected to login
- ✅ Session invalidated
- ✅ Must login again

---

## ✅ **Test 11: Session Data Integrity**

### **Steps:**
1. Login to Student Module
2. Open DevTools → Application → Local Storage
3. Check `emblazers_session` value

### **Expected JSON Structure:**
```json
{
  "module": "student",
  "email": "student@emblazers.com",
  "name": "Student Admin",
  "role": "admin",
  "loggedIn": true,
  "loginTime": "2026-01-30T...",
  "expiresAt": 1738329600000
}
```

### **Verify:**
- ✅ All fields present
- ✅ `expiresAt` is ~3 days from now
- ✅ `module` matches current module
- ✅ `loggedIn` is `true`

---

## ✅ **Test 12: CRUD Operations While Logged In**

### **Test Student Module:**
1. Login to Student Module
2. Go to "Add Student"
3. Fill form and submit
4. **Expected:** Student added successfully
5. Go to "List Students"
6. **Expected:** New student appears in list
7. Refresh page (F5)
8. **Expected:** Still logged in, data still there

### **Repeat for other modules as needed**

---

## ✅ **Test 13: Change Password Feature**

### **Steps:**
1. Login to any module
2. Click "Change Password" in sidebar
3. Enter:
   - Current password: `12345678`
   - New password: `newpassword123`
4. Submit
5. **Expected:** Password changed successfully
6. Logout
7. Try logging in with old password
8. **Expected:** Login fails
9. Login with new password
10. **Expected:** Login succeeds

---

## ✅ **Test 14: Concurrent Module Sessions**

### **Steps:**
1. Open Tab 1: Login to Student Module
2. Open Tab 2: Login to HR Module
3. Switch between tabs

### **Expected Results:**
- ✅ Each tab maintains its own module session
- ✅ Student tab shows student data
- ✅ HR tab shows HR data
- ✅ No cross-contamination
- ✅ Both sessions persist independently

---

## ✅ **Test 15: Network Failure Handling**

### **Steps:**
1. Login to any module
2. Open DevTools → Network tab
3. Set network to "Offline"
4. Try to navigate or refresh

### **Expected Results:**
- ✅ Session data still in localStorage
- ✅ UI still shows logged-in state (from localStorage)
- ✅ API calls fail gracefully
- ✅ When network restored, everything works again

---

## 🔍 **Browser Console Checks**

### **What to Look For:**

**Good Signs (✅):**
- No authentication errors
- No "401 Unauthorized" errors
- No "session expired" warnings (within 3 days)
- Successful API responses

**Bad Signs (❌):**
- Repeated redirect loops
- "Unauthorized" errors on protected routes
- localStorage errors
- JWT validation failures

---

## 📊 **DevTools Inspection**

### **Application → Local Storage:**

**After Login:**
```
emblazers_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
emblazers_session: "{\"module\":\"student\",\"email\":\"student@emblazers.com\"...}"
```

**After Logout:**
```
(both keys should be deleted)
```

### **Network → Headers:**

**Protected API Requests:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ **Success Criteria:**

Your authentication system is working correctly if:

- [x] All 15 tests pass
- [x] No automatic logout within 3 days
- [x] Page refresh keeps session
- [x] Browser restart keeps session
- [x] Manual logout works
- [x] Module isolation works
- [x] Invalid credentials rejected
- [x] Session expiry cleanup works
- [x] No errors in console
- [x] All CRUD operations work while logged in

---

## 🚨 **Common Issues & Solutions:**

### **Issue 1: Automatic Logout on Page Refresh**
**Solution:** Check that `isSessionValid()` is not returning false
- Verify `expiresAt` timestamp is set correctly
- Check browser console for errors

### **Issue 2: Redirect Loop**
**Solution:** Check ModuleLayout authentication logic
- Ensure `isAuthenticated()` doesn't have circular dependencies
- Verify useEffect dependencies are correct

### **Issue 3: Session Not Persisting**
**Solution:** Check localStorage
- Verify data is being saved
- Check for localStorage quota errors
- Ensure localStorage is not disabled

### **Issue 4: Token Invalid Errors**
**Solution:** Check JWT_SECRET
- Verify `.env` has correct JWT_SECRET
- Restart server after changing .env
- Check token hasn't expired

---

## 📝 **Testing Log Template:**

```
Date: _____________
Tester: _____________

Test 1: Basic Login & Logout         [ ] Pass  [ ] Fail
Test 2: Session Persistence (Refresh) [ ] Pass  [ ] Fail
Test 3: Session Persistence (Restart) [ ] Pass  [ ] Fail
Test 4: Multiple Tabs                 [ ] Pass  [ ] Fail
Test 5: Wrong Module Access           [ ] Pass  [ ] Fail
Test 6: Direct URL Access             [ ] Pass  [ ] Fail
Test 7: Session Expiry                [ ] Pass  [ ] Fail
Test 8: All Module Logins             [ ] Pass  [ ] Fail
Test 9: Invalid Credentials           [ ] Pass  [ ] Fail
Test 10: Token Validation             [ ] Pass  [ ] Fail
Test 11: Session Data Integrity       [ ] Pass  [ ] Fail
Test 12: CRUD Operations              [ ] Pass  [ ] Fail
Test 13: Change Password              [ ] Pass  [ ] Fail
Test 14: Concurrent Sessions          [ ] Pass  [ ] Fail
Test 15: Network Failure              [ ] Pass  [ ] Fail

Notes:
_______________________________________________________
_______________________________________________________
```

---

**Run through this checklist to thoroughly test the authentication system!** ✅
