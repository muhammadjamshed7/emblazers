# Library Module Enhancement - Progress Update

## ✅ COMPLETED (Backend Phase 1)

### 1. Schema Updates (✅ 100% DONE)
**File:** `shared/schema.ts`
- ✅ Added BookCategory schema with isDefault flag
- ✅ Enhanced Book schema with edition, publisher, totalCopies, availableCopies
- ✅ Improved BookIssue schema with member details, class/section, fine tracking

### 2. API Routes (✅ 100% DONE)  
**File:** `server/routes.ts`
- ✅ Added insertBookCategorySchema to imports
- ✅ Created 5 category endpoints (GET, GET/:id, POST, PATCH, DELETE)
- ✅ Enhanced book issue endpoint with availability checking
- ✅ Enhanced book return endpoint with fine calculation
- ✅ Added automatic overdue status detection
- ✅ Created library statistics endpoint

**New Endpoints:**
```
GET    /api/book-categories
GET    /api/book-categories/:id
POST   /api/book-categories
PATCH  /api/book-categories/:id
DELETE /api/book-categories/:id
GET    /api/library/statistics
```

**Enhanced Logic:**
- Book Issue: Checks availability, decrements copies, updates status
- Book Return: Calculates fines ($5/day overdue), increments copies
- Overdue Detection: Auto-updates status on GET requests
- Statistics: Real-time calculation of all library metrics

## 🔄 IN PROGRESS (Backend Phase 2)

### 3. Storage Layer Implementation
**Files Needed:** `server/mongo-storage.ts` and `server/storage.ts`

**Required Methods:**

#### BookCategory Methods:
```typescript
async getBookCategories(): Promise<BookCategory[]>
async getBookCategory(id: string): Promise<BookCategory | null>
async createBookCategory(data: InsertBookCategory): Promise<BookCategory>
async updateBookCategory(id: string, updates: Partial<BookCategory>): Promise<BookCategory | null>
async deleteBookCategory(id: string): Promise<boolean>
```

#### Default Categories Seeding:
```typescript
// Add to initializeDefaultData() or similar
const defaultCategories = [
  "General", "Fiction", "Non-Fiction", "Reference", 
  "Textbook", "Science", "History", "Biography", "Children"
];

for (const category of defaultCategories) {
  await createBookCategory({
    name: category,
    isDefault: true,
    createdAt: new Date().toISOString()
  });
}
```

## 📋 PENDING (Frontend Implementation)

### 4. Library Data Hook
**File:** `client/src/pages/library/library-data.ts`

**Updates Needed:**
- Add `useQuery` for book categories
- Add `useQuery` for library statistics
- Add mutations for category CRUD
- Export categories and statistics
- Remove members from nav items

### 5. Books Component Enhancement
**File:** `client/src/pages/library/books.tsx`

**Features to Add:**
- Category dropdown (from database)
- "Add Category" button & dialog
- Category selection in book form
- Edition and publisher fields
- Total copies and available copies fields

### 6. Issue/Return Component (Complete Rewrite)
**File:** `client/src/pages/library/issue.tsx`

**New UI Structure:**
```
[Tabs: Issue Book | Return Book | Issue History]

Issue Tab:
- Member Type: [Student] [Staff] (toggle)
- Search: [ID or Name input] → Auto-fetch details
- Student: Show class/section
- Staff: Show designation
- Book Search: [Searchable dropdown by title/ISBN/accession]
- Due Date: Auto-calculate (+14 days)
- [Issue Book button]

Return Tab:
- Issue Record selector
- Return Date: [date picker]
- Fine: Auto-calculated (read-only)
- [Process Return button]

History Tab:
- Filters: Status, Member Type
- Search bar
- Data table with View buttons
- Status badges (Issued/Returned/Overdue)
```

### 7. Dashboard Enhancement
**File:** `client/src/pages/library/dashboard.tsx`

**Statistics Cards:**
- Total Books
- Issued Books
- Available Books  
- Overdue Books
- Total Fines
- Pending Fines

**Charts:**
- Books by Category (bar chart)
- Issue trends

**Tables:**
- Recent Issues
- Overdue Books

### 8. App.tsx Updates
**File:** `client/src/App.tsx`

**Changes:**
- Remove LibraryMembers import
- Remove /library/members route
- Keep only: dashboard, books, issue, reports

### 9. Navigation Updates
**File:** `client/src/pages/library/library-data.ts`

**Remove:**
```typescript
{ label: "Members", path: "/library/members", icon: Users }
```

## Implementation Priority Queue

**Backend (Immediate):**
1. ✅ Schema updates (DONE)
2. ✅ API routes (DONE)
3. 🔄 Add BookCategory model to mongo-storage.ts
4. 🔄 Add storage methods to storage.ts
5. 🔄 Seed default categories on startup

**Frontend (Next):**
6. Update library-data.ts (fetch categories & stats)
7. Enhance books.tsx (category management)
8. Rewrite issue.tsx (new UI)
9. Enhance dashboard.tsx (statistics)
10. Update App.tsx (remove members route)
11. Testing & validation

## Code Templates for Storage Layer

### MongoDB Storage (mongo-storage.ts)

```typescript
import { BookCategory } from './models/BookCategory';

// In MongoStorage class:

async getBookCategories(): Promise<BookCategory[]> {
  await this.ensureConnection();
  const docs = await BookCategoryModel.find().sort({ isDefault: -1, name: 1 });
  return docs.map(toDTO<BookCategory>);
}

async getBookCategory(id: string): Promise<BookCategory | null> {
  await this.ensureConnection();
  const doc = await BookCategoryModel.findOne({ id });
  return doc ? toDTO<BookCategory>(doc) : null;
}

async createBookCategory(data: InsertBookCategory): Promise<BookCategory> {
  await this.ensureConnection();
  const doc = await BookCategoryModel.create({
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString()
  });
  return toDTO<BookCategory>(doc);
}

async updateBookCategory(id: string, updates: Partial<BookCategory>): Promise<BookCategory | null> {
  await this.ensureConnection();
  const doc = await BookCategoryModel.findOneAndUpdate(
    { id },
    { $set: updates },
    { new: true }
  );
  return doc ? toDTO<BookCategory>(doc) : null;
}

async deleteBookCategory(id: string): Promise<boolean> {
  await this.ensureConnection();
  const result = await BookCategoryModel.deleteOne({ id });
  return result.deletedCount > 0;
}
```

### In-Memory Storage (storage.ts)

```typescript
// Add to Storage class:
private bookCategories: Map<string, BookCategory> = new Map();

async getBookCategories(): Promise<BookCategory[]> {
  return Array.from(this.bookCategories.values());
}

async getBookCategory(id: string): Promise<BookCategory | null> {
  return this.bookCategories.get(id) || null;
}

async createBookCategory(data: InsertBookCategory): Promise<BookCategory> {
  const id = randomUUID();
  const category: BookCategory = { 
    ...data, 
    id,
    createdAt: new Date().toISOString()
  };
  this.bookCategories.set(id, category);
  return category;
}

async updateBookCategory(id: string, updates: Partial<BookCategory>): Promise<BookCategory | null> {
  const existing = this.bookCategories.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  this.bookCategories.set(id, updated);
  return updated;
}

async deleteBookCategory(id: string): Promise<boolean> {
  return this.bookCategories.delete(id);
}
```

## Testing Checklist  

Backend:
- [ ] POST /api/book-categories creates category
- [ ] GET /api/book-categories returns all
- [ ] DELETE prevents deleting default categories
- [ ] POST /api/book-issues checks availability
- [ ] POST /api/book-issues decrements availableCopies
- [ ] PATCH /api/book-issues/:id calculates fines
- [ ] PATCH /api/book-issues/:id increments copies on return
- [ ] GET /api/library/statistics returns correct counts

Frontend:
- [ ] Categories dropdown populated
- [ ] Can create custom category
- [ ] Can issue book to student
- [ ] Can issue book to staff
- [ ] Return calculates correct fine
- [ ] Dashboard shows real statistics
- [ ] Overdue books highlighted
- [ ] Search works across all fields

## Next Action Items

1. Create BookCategory Mongoose model
2. Implement storage methods
3. Seed default categories
4. Test backend endpoints
5. Then move to frontend implementation

---
**Current Status:** Backend routes complete. Need storage layer implementation to proceed.
**Estimated Remaining:** 6-8 hours of development + testing
