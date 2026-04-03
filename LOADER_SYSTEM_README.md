# Loader System - Complete Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Custom Hooks](#custom-hooks)
5. [Usage Examples](#usage-examples)
6. [Migration Guide](#migration-guide)
7. [Best Practices](#best-practices)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## Overview

A production-ready, scalable loader system for React applications. Provides consistent loading states across all pages, tables, forms, and actions.

### Features
✅ **Reusable** - Single implementation used everywhere
✅ **Scalable** - Works for small pages and large ERP/CRM systems
✅ **TypeScript Support** - Full type definitions included
✅ **Clean Architecture** - Separation of concerns (UI vs Logic)
✅ **Prevents Duplicate API Calls** - Built-in request cancellation
✅ **Auto-Reset** - Loaders always clear in finally blocks
✅ **Error Handling** - Consistent error state management
✅ **Progressive Enhancement** - Can adopt incrementally module by module

### Loader Types Supported
- **Full Page Loader** - Initial page loads
- **Table/Overlay Loader** - Data refresh with existing content
- **Button Loader** - Submit/delete/approve actions
- **Progress Loader** - File uploads with percentage
- **Inline/Dot Loader** - Small inline loading indicators
- **Global Context** - App-wide loading states (optional)

---

## Architecture

```
src/
├── components/
│   └── common/
│       └── Loaders/
│           ├── Spinner.tsx          # Base spinner with variants
│           ├── FullPageLoader.tsx   # Full-screen page loader
│           ├── OverlayLoader.tsx    # Table/card overlay
│           ├── ButtonLoader.tsx     # Loading buttons
│           ├── ProgressLoader.tsx   # Upload progress bar
│           ├── DotLoader.tsx        # Small inline dots
│           ├── loaderStyles.css     # All CSS animations
│           └── index.ts             # Barrel exports
├── hooks/
│   ├── useAsync.ts         # Core async state management
│   ├── usePageLoader.ts    # Page-level data fetching
│   ├── useTableLoader.ts   # Table with pagination/filters
│   ├── useActionLoader.ts  # Button actions (create/delete)
│   ├── useUploadLoader.ts  # File uploads with progress
│   └── index.ts
├── context/
│   └── LoadingContext.tsx  # Global loading state (optional)
├── utils/
│   └── loadingUtils.ts     # Helper functions
└── api/
    └── api.js              # Enhanced with global request tracking
```

---

## Components

### 1. Spinner

The base spinner component with premium animations matching your current design.

```tsx
import { Spinner } from '@/components/common/Loaders';

// Basic usage
<Spinner size="md" variant="primary" />

// With label
<Spinner size="lg" label="Loading..." />

// In a button
<button>
  {loading && <Spinner size="sm" />}
  Submit
</button>

// Sizes: 'sm' | 'md' | 'lg' | 'xl'
// Variants: 'primary' | 'secondary' | 'white'
```

### 2. FullPageLoader

Full-screen loader for initial page loads.

```tsx
import { FullPageLoader } from '@/components/common/Loaders';

// Show on initial load only
if (loading && !hasData) {
  return <FullPageLoader message="Loading Candidates..." />;
}

// With custom styling
<FullPageLoader
  message="Processing..."
  spinnerSize="xl"
  backgroundColor="rgba(255,255,255,0.9)"
  showBlur
/>
```

### 3. OverlayLoader

Semi-transparent overlay with spinner for tables/cards.

```tsx
import { OverlayLoader } from '@/components/common/Loaders';

<div className="table-card" style={{ position: 'relative' }}>
  <OverlayLoader visible={loading} size="md" message="Refreshing..." />
  {/* Table content */}
</div>
```

### 4. ButtonLoader

Button with built-in loading state.

```tsx
import { ButtonLoader } from '@/components/common/Loaders';

<ButtonLoader
  loading={submitting}
  onClick={handleSubmit}
  variant="primary"
  loadingText="Saving..."
  className="btn-primary"
>
  Save Changes
</ButtonLoader>

// Variants: 'primary' | 'secondary' | 'danger' | 'ghost'
// Sizes: 'sm' | 'md' | 'lg'
```

### 5. ProgressLoader

Animated progress bar for uploads.

```tsx
import { ProgressLoader } from '@/components/common/Loaders';

<ProgressLoader
  progress={uploadProgress}
  message="Uploading resume..."
  variant="primary"
  height={8}
/>
```

### 6. DotLoader

Small bouncing dots for inline loading.

```tsx
import { DotLoader } from '@/components/common/Loaders';

// In select dropdowns, search boxes
<span>Loading options <DotLoader size={6} gap={4} /></span>
```

---

## Custom Hooks

### useAsync - Core Hook

Foundation for all other hooks. Manages async operations with loading/error states.

```tsx
import { useAsync } from '@/hooks';

const { data, loading, error, execute, reset } = useAsync(fetchUsers, []);

// Execute manually
const handleClick = async () => {
  const result = await execute();
  console.log(result);
};

// Reset state
const handleReset = () => {
  reset();
};
```

### usePageLoader - Page Data

For page-level data fetching with debouncing.

```tsx
import { usePageLoader } from '@/hooks';

const { data, loading, error, reload, setParams } = usePageLoader({
  fetchFn: async (params) => {
    return await api.get('/users', { params });
  },
  autoLoad: true,
  debounceMs: 500
});

// Use in component
useEffect(() => {
  // Auto-loads on mount with debounce
}, []);

// Reload manually
<button onClick={reload}>Refresh</button>;
```

### useTableLoader - Tables with Pagination

**Most Important Hook** - Used for all list views.

```tsx
import { useTableLoader } from '@/hooks';

const {
  data,           // { data: [], total: 100, page: 0, limit: 10, totalPages: 10 }
  loading,
  error,
  page,
  limit,
  total,
  totalPages,
  setPage,
  setLimit,
  setFilters,
  filters,
  reload,
  reset,
  nextPage,
  prevPage
} = useTableLoader({
  fetchFn: async (page, limit, filters) => {
    const res = await candidateService.getAllCandidates(page, limit, filters);
    return {
      data: res.data?.data || [],
      total: res.data?.total || 0,
      page,
      limit,
      totalPages: Math.ceil((res.data?.total || 0) / limit)
    };
  },
  initialLimit: 10,
  autoLoad: true,
  resetPageOnFilter: true
});

// Render table
return (
  <div>
    <table>
      {data?.data?.map(item => (
        <tr key={item.id}>{item.name}</tr>
      ))}
    </table>

    {/* Table overlay loader */}
    <OverlayLoader visible={loading && data?.data?.length > 0} />

    {/* Pagination */}
    <div>
      <button onClick={prevPage} disabled={page === 0}>Previous</button>
      <span>Page {page + 1} of {totalPages}</span>
      <button onClick={nextPage} disabled={page >= totalPages - 1}>Next</button>
    </div>
  </div>
);
```

### useActionLoader - Form Submissions

For create, update, delete operations.

```tsx
import { useActionLoader } from '@/hooks';

const {
  execute,
  loading,
  error,
  result,
  reset
} = useActionLoader({
  actionFn: async (id, data) => {
    return await candidateService.updateCandidate(id, data);
  },
  onSuccess: (result) => {
    toast.success('Saved!');
    reloadList(); // Refresh table
  },
  onError: (error) => {
    toast.error(error.message);
  },
  autoReset: true
});

// Use in button
<ButtonLoader
  loading={loading}
  onClick={() => execute(candidateId, formData)}
>
  Save
</ButtonLoader>
```

### useUploadLoader - File Uploads

For file uploads with progress tracking.

```tsx
import { useUploadLoader } from '@/hooks';

const {
  upload,
  progress,
  uploading,
  error,
  reset
} = useUploadLoader();

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  try {
    const result = await upload(file, '/upload', { folder: 'resumes' });
    setFormData(prev => ({ ...prev, resume: result.url }));
  } catch (err) {
    // Error already handled
  }
};

return (
  <div>
    <input type="file" onChange={handleFileChange} />
    {uploading && <ProgressLoader progress={progress} message="Uploading..." />}
    {result && <div>File uploaded!</div>}
  </div>
);
```

---

## Usage Examples

### Example 1: Candidate List Page (Refactored)

```tsx
import { useTableLoader } from '@/hooks';
import { OverlayLoader, ButtonLoader } from '@/components/common/Loaders';

const CandidateList = () => {
  const [filters, setFilters] = useState({ name: '', status: '' });

  const {
    data,
    loading,
    page,
    total,
    setPage,
    setFilters: setTableFilters
  } = useTableLoader({
    fetchFn: async (page, limit, filters) => {
      const res = await candidateService.getAllCandidates(page, limit, filters);
      return {
        data: res.data?.data || [],
        total: res.data?.total || 0,
        page,
        limit,
        totalPages: Math.ceil((res.data?.total || 0) / limit)
      };
    }
  });

  // Filter change handler
  const handleSearch = (name) => {
    setFilters({ name });
    setTableFilters({ name });
  };

  // PAGE LOADER: Show on initial load
  if (loading && data?.data?.length === 0) {
    return <FullPageLoader message="Loading Candidates..." />;
  }

  return (
    <div>
      <h1>Candidate Management</h1>

      {/* Search inputs */}
      <input value={filters.name} onChange={e => handleSearch(e.target.value)} />

      <div style={{ position: 'relative' }}>
        {/* TABLE LOADER: Overlay when refreshing */}
        <OverlayLoader visible={loading && data?.data?.length > 0} />

        <table>
          <thead>...</thead>
          <tbody>
            {data?.data?.map(candidate => (
              <tr key={candidate.id}>
                <td>{candidate.name}</td>
                <td>
                  <ButtonLoader
                    loading={false}
                    onClick={() => handleDelete(candidate.id)}
                    variant="danger"
                  >
                    Delete
                  </ButtonLoader>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
};
```

### Example 2: Add/Edit Form

```tsx
import { useActionLoader } from '@/hooks';
import { ButtonLoader, ProgressLoader } from '@/components/common/Loaders';
import { useUploadLoader } from '@/hooks';

const CandidateForm = ({ candidateId, onSuccess }) => {
  const [formData, setFormData] = useState(initialForm);

  // Action loader for submission
  const { execute: submitForm, loading: submitting } = useActionLoader({
    actionFn: async (data) => {
      if (candidateId) {
        return await candidateService.update(candidateId, data);
      }
      return await candidateService.create(data);
    },
    onSuccess: () => {
      toast.success('Saved!');
      onSuccess?.();
    }
  });

  // Upload loader
  const { upload, progress, uploading } = useUploadLoader();

  const handleSubmit = async () => {
    await submitForm(formData);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const result = await upload(file, '/upload');
    if (result) {
      setFormData(prev => ({ ...prev, resume: result.url }));
    }
  };

  return (
    <form>
      {/* Form fields */}
      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />

      {/* File upload with progress */}
      <div onClick={() => !uploading && fileInput.click()}>
        {uploading ? (
          <ProgressLoader progress={progress} message="Uploading..." />
        ) : formData.resume ? (
          <div>File attached ✓</div>
        ) : (
          <div>Click to upload</div>
        )}
      </div>
      <input type="file" hidden onChange={handleFileChange} />

      {/* Submit button with loader */}
      <ButtonLoader
        loading={submitting}
        onClick={handleSubmit}
        variant="primary"
        loadingText="Saving..."
      >
        Save Candidate
      </ButtonLoader>
    </form>
  );
};
```

### Example 3: Global Loading Context (Optional)

Wrap your app with `LoadingProvider`:

```tsx
// App.jsx
import { LoadingProvider } from '@/context/LoadingContext';

const App = () => (
  <LoadingProvider>
    <Router />
  </LoadingProvider>
);

// Any component
import { useLoadingContext } from '@/context/LoadingContext';

const SomeComponent = () => {
  const { startLoading, stopLoading } = useLoadingContext();

  const handleCriticalAction = async () => {
    const key = startLoading('Processing...');

    try {
      await criticalOperation();
    } finally {
      stopLoading(key);
    }
  };

  // Show global overlay when needed
  const { isLoading } = useLoadingContext();
  if (isLoading()) {
    return <FullPageLoader />;
  }

  return <div>...</div>;
};
```

---

## Migration Guide

### Step 1: Install Dependencies
No new dependencies required! All components are built with React + CSS.

### Step 2: Add LoaderSystem to Your Project

Copy the entire structure to your project:
```
src/
├── components/common/Loaders/
├── hooks/
├── context/
└── utils/
```

Import the CSS in your main entry file:
```tsx
// App.jsx or main.jsx
import '@/components/common/Loaders/loaderStyles.css';
```

### Step 3: Migrate One Module at a Time

Start with **Candidate module** as your pilot:

1. **Read old code** - Identify all loading states: `loading`, `submitting`, `uploading`, etc.

2. **Replace page loader**:
```tsx
// Old
if (loading && candidates.length === 0) {
  return <div className="spinner">...</div>;
}

// New
if (loading && candidates.length === 0) {
  return <FullPageLoader message="Loading..." />;
}
```

3. **Replace table overlay**:
```tsx
// Old
{loading && candidates.length > 0 && (
  <div className="loading-overlay">...</div>
)}

// New
<OverlayLoader visible={loading && candidates.length > 0} />
```

4. **Replace buttons**:
```tsx
// Old
<button disabled={submitting}>
  {submitting ? 'Processing...' : 'Save'}
</button>

// New
<ButtonLoader
  loading={submitting}
  onClick={handleSubmit}
>
  Save
</ButtonLoader>
```

5. **Replace file upload Progress**:
```tsx
// Old
{uploading && (
  <div className="upload-loader-container">
    <div className="loader-spinner"></div>
    <p>Uploading... {uploadProgress}%</p>
    <div className="progress-bar" style={{width: ${uploadProgress}%}} />
  </div>
)}

// New
{uploading && <ProgressLoader progress={uploadProgress} message="Uploading..." />}
```

6. **Replace useTableLoader**:
```tsx
// OLD PATTERN:
const [candidates, setCandidates] = useState([]);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(0);
const [filters, setFilters] = useState({});

const fetchData = async () => {
  setLoading(true);
  try {
    const res = await service.getAll(page, 10, filters);
    setCandidates(res.data);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const timer = setTimeout(fetchData, 500);
  return () => clearTimeout(timer);
}, [page, filters]);

// NEW PATTERN:
const {
  data,
  loading,
  page,
  setPage,
  setFilters
} = useTableLoader({
  fetchFn: async (page, limit, filters) => {
    const res = await service.getAll(page, limit, filters);
    return {
      data: res.data?.data || [],
      total: res.data?.total || 0,
      page,
      limit,
      totalPages: Math.ceil((res.data?.total || 0) / limit)
    };
  },
  initialLimit: 10
});

// Access candidates from data.data
const candidates = data?.data || [];
```

7. **Replace useActionLoader**:
```tsx
// OLD:
const handleDelete = async (id) => {
  setSubmitting(true);
  try {
    await service.delete(id);
    toast.success('Deleted');
    fetchData();
  } finally {
    setSubmitting(false);
  }
};

// NEW:
const { execute: deleteItem, loading: deleting } = useActionLoader({
  actionFn: service.delete,
  onSuccess: () => {
    toast.success('Deleted');
    reload(); // from useTableLoader
  }
});

const handleDelete = (id) => {
  deleteItem(id);
};
```

8. **Replace useUploadLoader**:
```tsx
// OLD:
const [uploadProgress, setUploadProgress] = useState(0);
const [uploading, setUploading] = useState(false);

const handleUpload = async (file) => {
  setUploading(true);
  setUploadProgress(0);
  try {
    await api.post('/upload', file, {
      onUploadProgress: (e) => {
        setUploadProgress(Math.round((e.loaded * 100) / e.total));
      }
    });
  } finally {
    setUploading(false);
  }
};

// NEW:
const { upload, progress, uploading } = useUploadLoader();

const handleUpload = async (file) => {
  await upload(file, '/upload');
};
```

### Step 4: Test & Verify

1. Check all loaders appear correctly
2. Verify no duplicate API calls on rapid filter changes
3. Confirm error states display properly
4. Test cancel/abort functionality

### Step 5: Roll Out to Other Modules

Apply same pattern to:
- Employees module
- Projects module
- Roles module
- Attendance module
- Dashboard cards
- Reports
- Settings

---

## Best Practices

### ✅ DO

1. **Use Hooks for All Async Logic**
   ```tsx
   // Good
   const { data, loading } = useTableLoader({ fetchFn });
   // Bad
   const [data, setData] = useState([]);
   const [loading, setLoading] = useState(false);
   // + manual fetch function
   ```

2. **Show Page Loader on Initial Load Only**
   ```tsx
   // Correct - prevents jarring UX
   if (loading && data?.length === 0) {
     return <FullPageLoader />;
   }

   // Wrong - shows loader on every refresh
   if (loading) {
     return <FullPageLoader />;
   }
   ```

3. **Use OverlayLoader for Table Refreshes**
   ```tsx
   <OverlayLoader visible={loading && data?.length > 0} />
   ```

4. **Always Reset in Finally Blocks**
   The hooks do this automatically. If you write custom async:
   ```tsx
   try { /* do work */ }
   finally {
     setLoading(false); // ✅ Always in finally
   }
   ```

5. **Use ButtonLoader for All Actions**
   Prevents double-submit and provides feedback:
   ```tsx
   <ButtonLoader loading={loading} onClick={handleSave}>Save</ButtonLoader>
   ```

6. **Keep Loader Logic Close to UI**
   ```tsx
   // Good - loader state in component
   const { loading } = useTableLoader();
   return <OverlayLoader visible={loading} />;

   // Bad - global loader in context for local state
   ```

7. **Leverage Automatic Cancellation**
   ```tsx
   // Previous requests automatically cancelled when params change
   const { setPage } = useTableLoader();
   // Rapid clicking won't cause race conditions
   ```

### ❌ DON'T

1. **Don't Create Separate Loader States for Everything**
   ```tsx
   // Bad - too many states
   const [loadingList, setLoadingList] = useState(false);
   const [loadingDetails, setLoadingDetails] = useState(false);
   const [loadingUpload, setLoadingUpload] = useState(false);

   // Good - use appropriate hook
   const table = useTableLoader();
   const upload = useUploadLoader();
   ```

2. **Don't Forget Error Handling**
   ```tsx
   // Bad - no error UI
   const { loading, error } = useTableLoader();
   if (error) return null; // 😱

   // Good - show error
   if (error) {
     return <div className="error-message">{error.message}</div>;
   }
   ```

3. **Don't Use FullPageLoader for Every Load**
   ```tsx
   // Bad - jarring UX
   if (loading) return <FullPageLoader />;

   // Good - only initial load
   if (loading && data?.length === 0) return <FullPageLoader />;
   // For subsequent loads use overlay
   ```

4. **Don't Manually Debounce useTableLoader Filters**
   ```tsx
   // Bad - don't add debounce, hook handles it
   const [filters, setFilters] = useState({});
   useDebounce(() => {
     fetchData(filters);
   }, 500);

   // Good - setFilters handles debouncing
   const { setFilters } = useTableLoader({...});
   setFilters({ name: 'John' }); // Auto-debounced
   ```

5. **Don't Forget to Merge Fetch Responses**
   ```tsx
   // In useTableLoader fetchFn, return standardized format:
   return {
     data: response.items || response.data || [],
     total: response.total || 0,
     page,
     limit,
     totalPages: Math.ceil(total / limit)
   };
   ```

---

## Common Mistakes to Avoid

### 1. Race Conditions on Rapid Navigation
✅ **Fixed automatically** by hooks with AbortController

### 2. Loaders Not Resetting on Error
✅ **Fixed** - All hooks reset in finally blocks

### 3. Duplicate API Calls
✅ **Fixed** - Hooks prevent duplicate if same params

### 4. Memory Leaks on Unmount
✅ **Fixed** - All hooks cleanup on unmount

### 5. Inconsistent Loader UI
✅ **Fixed** - Single Spinner component used everywhere

---

## Recommended Architecture for Enterprise Scale

### Folder Structure
```
src/
├── modules/
│   ├── candidates/
│   │   ├── components/
│   │   │   ├── CandidateList.tsx
│   │   │   ├── CandidateForm.tsx
│   │   │   └── CandidateDetail.tsx
│   │   ├── hooks/
│   │   │   └── useCandidateLoader.ts (optional, composes useTableLoader)
│   │   ├── services/
│   │   │   └── candidateService.ts
│   │   └── index.ts
│   ├── employees/
│   └── projects/
├── shared/
│   ├── components/
│   │   └── loaders/      (loader system)
│   ├── hooks/
│   │   └── loaders/      (loader hooks)
│   ├── context/
│   └── utils/
└── App.tsx
```

### Module-Level Hook Composition

Create module-specific hooks that compose the generic ones:

```tsx
// modules/candidates/hooks/useCandidateLoader.ts
import { useTableLoader } from '@/shared/hooks';

export const useCandidateLoader = (initialFilters = {}) => {
  return useTableLoader({
    fetchFn: async (page, limit, filters) => {
      const res = await candidateService.getAll(page, limit, { ...initialFilters, ...filters });
      return {
        data: res.data?.data || [],
        total: res.data?.total || 0,
        page,
        limit,
        totalPages: Math.ceil((res.data?.total || 0) / limit)
      };
    },
    initialLimit: 10
  });
};

// Then in component:
const { data, loading, setFilters } = useCandidateLoader();
```

This keeps your components clean and reusable.

---

## Production Checklist

- [x] All components have loading states
- [x] Buttons disabled during submission
- [x] Error boundaries for graceful failures
- [x] Request cancellation on param change
- [x] Cleanup on component unmount
- [x] Consistent UX across all modules
- [x] TypeScript types included
- [x] Accessibility (ARIA labels on loaders)
- [x] Mobile responsive loading indicators
- [x] No memory leaks (verify with React DevTools)

---

## Support & Feedback

This loader system is designed to be:
- **Simple** to use
- **Consistent** across the app
- **Maintainable** for large teams
- **Performant** with built-in optimizations

**Next Steps:**
1. Refactor Candidate module using the example
2. Apply same pattern to Employees, Projects, etc.
3. Create module-specific hooks as shown above
4. Add unit tests for critical loader logic

---

## Quick Reference

| Use Case | Hook | Component |
|----------|------|-----------|
| Page data | `usePageLoader` | `FullPageLoader` |
| Table/list | `useTableLoader` | `OverlayLoader` |
| Form submit | `useActionLoader` | `ButtonLoader` |
| File upload | `useUploadLoader` | `ProgressLoader` |
| Inline indicator | - | `DotLoader` |
| Global state | `LoadingContext` | Any loader |

---

**Version:** 1.0.0
**Last Updated:** 2026-04-03
**Compatible With:** React 18+, TypeScript 4+
