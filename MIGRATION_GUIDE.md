# Loader System Migration Guide

Step-by-step instructions to migrate existing modules to the new loader system.

---

## Quick Start

### 1. Import Loader CSS (One-time Setup)

Add to your main entry file (`main.jsx` or `App.jsx`):

```tsx
import '@/components/common/Loaders/loaderStyles.css';
```

### 2. Wrap App with LoadingProvider (Optional)

```tsx
import { LoadingProvider } from '@/context/LoadingContext';

const App = () => (
  <LoadingProvider>
    <YourApp />
  </LoadingProvider>
);
```

### 3. Start Migration

Choose a module (recommend starting with Candidate) and follow the steps below.

---

## Detailed Migration Checklist

### A. Page-Level Loader (Full Page Spinner)

**Before:**
```tsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData().finally(() => setLoading(false));
}, []);

if (loading && candidates.length === 0) {
  return (
    <div className="spinner">
      <Loader2 className="animate-spin" />
      Loading...
    </div>
  );
}
```

**After:**
```tsx
import { FullPageLoader } from '@/components/common/Loaders';
// Remove: const [loading, setLoading] = useState(true);

const { data, loading } = useTableLoader({ fetchFn });

if (loading && candidates.length === 0) {
  return <FullPageLoader message="Loading Candidates..." />;
}
```

---

### B. Table/List Data Loading

**Before:**
```tsx
const [candidates, setCandidates] = useState([]);
const [loading, setLoading] = useState(false);
const [page, setPage] = useState(0);
const [total, setTotal] = useState(0);
const [filters, setFilters] = useState({});

const fetchData = async () => {
  setLoading(true);
  try {
    const res = await candidateService.getAll(page, 10, filters);
    setCandidates(res.data.data);
    setTotal(res.data.total);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const timer = setTimeout(fetchData, 500);
  return () => clearTimeout(timer);
}, [page, filters]);

// Table overlay
{loading && candidates.length > 0 && (
  <div className="loading-overlay">...</div>
)}
```

**After:**
```tsx
import { useTableLoader } from '@/hooks';
import { OverlayLoader } from '@/components/common/Loaders';

const {
  data,           // { data: [], total: 0, page, limit, totalPages }
  loading,
  page,
  total,
  setPage,
  setFilters: setTableFilters,
  reload
} = useTableLoader({
  fetchFn: async (page, limit, filters) => {
    const res = await candidateService.getAll(page, limit, filters);
    return {
      data: res.data?.data || [],
      total: res.data?.total || 0,
      page,
      limit,
      totalPages: Math.ceil((res.data?.total || 0) / limit)
    };
  },
  initialLimit: 10,
  autoLoad: true
});

// Extract array from wrapped data structure
const candidates = data?.data || [];

// Table overlay
<OverlayLoader visible={loading && candidates.length > 0} size="md" />

// Filter handler
const handleFilterChange = (field, value) => {
  setFilters({ ...filters, [field]: value }); // local state for UI
  setTableFilters({ ...filters, [field]: value }); // triggers reload
};
```

---

### C. Action Buttons (Create/Update/Delete)

**Before:**
```tsx
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async () => {
  setSubmitting(true);
  try {
    await service.create(formData);
    toast.success('Created!');
    fetchData();
    setViewMode('list');
  } catch (error) {
    toast.error('Failed');
  } finally {
    setSubmitting(false);
  }
};

<button disabled={submitting}>
  {submitting ? 'Saving...' : 'Save'}
</button>
```

**After:**
```tsx
import { useActionLoader } from '@/hooks';
import { ButtonLoader } from '@/components/common/Loaders';

const { execute: submitForm, loading: submitting } = useActionLoader({
  actionFn: async (data) => {
    return await service.create(data);
  },
  onSuccess: () => {
    toast.success('Created!');
    reload(); // useTableLoader's reload function
    setViewMode('list');
  },
  onError: (error) => {
    toast.error(error.message || 'Failed');
  }
});

const handleSubmit = async () => {
  await submitForm(formData);
};

<ButtonLoader
  loading={submitting}
  onClick={handleSubmit}
  variant="primary"
  loadingText="Saving..."
>
  Save
</ButtonLoader>
```

**Delete Action:**
```tsx
const { execute: deleteItem, loading: deleting } = useActionLoader({
  actionFn: service.delete,
  onSuccess: () => {
    toast.success('Deleted');
    reload();
  }
});

const handleDelete = (id) => {
  if (confirm('Are you sure?')) {
    deleteItem(id);
  }
};

<ButtonLoader loading={deleting} onClick={() => handleDelete(item.id)} variant="danger">
  Delete
</ButtonLoader>
```

---

### D. File Uploads

**Before:**
```tsx
const [uploadProgress, setUploadProgress] = useState(0);
const [uploading, setUploading] = useState(false);

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  setUploading(true);
  setUploadProgress(0);

  try {
    await api.post('/upload', file, {
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      }
    });
  } finally {
    setUploading(false);
  }
};

// In JSX
{uploading && (
  <div>
    <div className="spinner"></div>
    <div className="progress-bar" style={{width: ${uploadProgress}%}}></div>
    <span>Uploading... {uploadProgress}%</span>
  </div>
)}
```

**After:**
```tsx
import { useUploadLoader } from '@/hooks';
import { ProgressLoader } from '@/components/common/Loaders';

const { upload, progress, uploading } = useUploadLoader();

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  try {
    const result = await upload(file, '/upload');
    setFormData(prev => ({ ...prev, resume: result.url }));
    toast.success('Uploaded');
  } catch (error) {
    toast.error('Upload failed');
  }
};

// In JSX
{uploading && <ProgressLoader progress={progress} message={`Uploading... ${progress}%`} />}
```

---

### E. View Details (Single Record)

**Before:**
```tsx
const [loadingDetails, setLoadingDetails] = useState(false);

const handleViewDetails = async (c) => {
  setLoadingDetails(true);
  try {
    const res = await service.getById(c.id);
    setSelectedCandidate(res.data);
  } finally {
    setLoadingDetails(false);
  }
};
```

**After:**
```tsx
import { useAsync } from '@/hooks';

const { execute: fetchDetails, loading: loadingDetails } = useAsync(
  async (id) => {
    const res = await service.getById(id);
    return res.data;
  }
);

const handleViewDetails = async (c) => {
  const data = await fetchDetails(c.id);
  if (data) {
    setSelectedCandidate(data);
  } else {
    // Fallback to list data
    setSelectedCandidate(c);
  }
};

// Button in table
<button onClick={() => handleViewDetails(candidate)} disabled={loadingDetails}>
  <Eye size={18} />
</button>
```

---

### F. Simple Async Operations

**Before:**
```tsx
const [saving, setSaving] = useState(false);

const handleSave = async () => {
  setSaving(true);
  try { /* ... */ }
  finally { setSaving(false); }
};
```

**After:**
```tsx
const { execute: save, loading: saving } = useAsync(async () => {
  await service.save(data);
});

const handleSave = async () => {
  await save();
};
```

---

## Migration Order

**Phase 1: Core Loader System**
1. Copy loader components & hooks to project
2. Add CSS imports
3. Test with simple component

**Phase 2: Pilot Migration**
1. Refactor Candidate.jsx completely (use provided refactored version)
2. Verify all loading states work
3. Test error scenarios
4. Document any customizations needed

**Phase 3: Apply to Other Modules**
1. **Employees.jsx** - Similar to Candidate pattern
2. **Projects.jsx** - Same useTableLoader pattern
3. **Roles.jsx** - Same pattern
4. **Attendance.jsx** - Check for date-specific filters
5. **Payroll.jsx** - May need custom hooks for calculations
6. **Settings.jsx** - Multiple forms, use useActionLoader for each
7. **Dashboard** - Use individual loaders per widget/chart

---

## Common Patterns by Module Type

### Pattern 1: CRUD List Pages
**Used by:** Candidates, Employees, Projects, Roles, Vacancies

**Hooks needed:**
- `useTableLoader` - For the main list
- `useActionLoader` - For create/update/delete
- `useUploadLoader` - If file attachments

**Components:**
- `FullPageLoader` - Initial load
- `OverlayLoader` - Table refresh
- `ButtonLoader` - All buttons
- `ProgressLoader` - Uploads

---

### Pattern 2: Detail View Pages
**Used by:** Employee Profile, Candidate Detail View

**Hooks needed:**
- `useAsync` - For fetching single record

**Example:**
```tsx
const { data: employee, loading, error } = useAsync(
  async (id) => {
    const res = await employeeService.getById(id);
    return res.data;
  }
);

if (loading) return <FullPageLoader />;
if (error) return <ErrorMessage />;

return <EmployeeDetail employee={employee} />;
```

---

### Pattern 3: Dashboard with Multiple Widgets
**Used by:** DashboardHome.jsx

**Hooks needed:**
- Multiple `usePageLoader` or `useAsync` hooks (one per widget)

**Pattern:**
```tsx
const {
  data: stats,
  loading: statsLoading
} = usePageLoader({ fetchFn: fetchStats });

const {
  data: recentActivity,
  loading: activityLoading
} = usePageLoader({ fetchFn: fetchRecentActivity });

// Each widget can show its own loader
return (
  <div>
    {statsLoading ? <StatsCardSkeleton /> : <StatsCard data={stats} />}
    {activityLoading ? <ActivitySkeleton /> : <ActivityList data={recentActivity} />}
  </div>
);
```

---

## Troubleshooting

### Issue: "Loader not showing on initial load"

**Cause:** The condition `loading && data?.length === 0` may not match your data structure.

**Fix:** Check your `useTableLoader` return format:
```tsx
// fetchFn must return this structure:
{
  data: [],  // Array of items
  total: 0,  // Total count
  page: 0,
  limit: 10,
  totalPages: 0
}

// In component:
const candidates = data?.data || [];  // Note the nested data

if (loading && candidates.length === 0) {
  return <FullPageLoader />;
}
```

---

### Issue: "Loader shows forever"

**Cause:** Loading state not resetting, or fetchFn throwing error.

**Fix:**
1. Check browser console for errors
2. Ensure fetchFn always returns a Promise that resolves
3. Add error handling in fetchFn:
```tsx
fetchFn: async (page, limit, filters) => {
  try {
    const res = await service.getAll(page, limit, filters);
    return {
      data: res.data?.data || [],
      total: res.data?.total || 0,
      page,
      limit,
      totalPages: Math.ceil((res.data?.total || 0) / limit)
    };
  } catch (error) {
    console.error('Fetch error:', error);
    // Return empty data instead of throwing
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0
    };
  }
}
```

---

### Issue: "Duplicate API calls on pagination"

**Cause:** Multiple state updates triggering reloads.

**Fix:** `useTableLoader` has built-in deduplication. Ensure you're not calling `setPage` and `setFilters` separately in a way that triggers multiple reloads.

**Correct:**
```tsx
// Changing both page and filter
setPage(0);  // triggers reload
setFilters({...}); // triggers reload again

// Better: Just set filters, hook resets page automatically
setFilters({ ... }); // sets page=0 and reloads once
```

---

### Issue: "File upload progress not smooth"

**Cause:** Axios needed for smooth progress tracking.

**Fix:** Current `useUploadLoader` uses fetch API. For production with smooth progress, use Axios:

```tsx
// In useUploadLoader, replace fetch with:
const response = await axios.post(endpoint, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: (progressEvent) => {
    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    setProgress(percent);
  }
});
```

---

## Need Help?

- Check `LOADER_SYSTEM_README.md` for full API reference
- Review `Candidate.refactored.jsx` for complete working example
- Refer to hooks documentation in `src/hooks/` for TypeScript types

---

## Migration Progress Tracker

Use this checklist to track your migration:

- [ ] Candidate module
- [ ] Interview module
- [ ] Offer module
- [ ] Vacancy module
- [ ] Employees module
- [ ] Projects module
- [ ] Roles module
- [ ] Attendance module
- [ ] Payroll module
- [ ] Dashboard widgets
- [ ] Reports pages
- [ ] Settings forms

---

**Estimated Time:**
- Candidate module: 2-3 hours (includes learning curve)
- Other modules: 1-2 hours each
- Full project migration: 1-2 weeks

**Tip:** Do one module completely (list + form + details) before moving to next. This ensures you understand the pattern thoroughly.
