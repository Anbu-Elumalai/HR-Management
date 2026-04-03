# Loader System - Quick Start Guide

## 30-Second Setup

```bash
# 1. Copy the loader directory structure
# Components: src/components/common/Loaders/
# Hooks: src/hooks/
# Context: src/context/
# Utils: src/utils/

# 2. Import CSS in your main file
import '@/components/common/Loaders/loaderStyles.css';

# 3. (Optional) Wrap app with LoadingProvider
import { LoadingProvider } from '@/context/LoadingContext';

<LoadingProvider>
  <App />
</LoadingProvider>
```

---

## Basic Usage Examples

### 1. Table with Pagination (Most Common)

```tsx
import { useTableLoader } from '@/hooks';
import { OverlayLoader, FullPageLoader, ButtonLoader } from '@/components/common/Loaders';

const MyPage = () => {
  const [filters, setFilters] = useState({ name: '' });

  const {
    data,
    loading,
    page,
    total,
    setPage,
    setFilters: setTableFilters
  } = useTableLoader({
    fetchFn: async (page, limit, filters) => {
      const res = await api.get('/items', { params: { page, limit, ...filters } });
      return {
        data: res.data.items,
        total: res.data.total,
        page,
        limit,
        totalPages: Math.ceil(res.data.total / limit)
      };
    }
  });

  const items = data?.data || [];

  // Initial load
  if (loading && items.length === 0) {
    return <FullPageLoader message="Loading..." />;
  }

  return (
    <div>
      <input value={filters.name} onChange={e => {
        setFilters({ name: e.target.value });
        setTableFilters({ name: e.target.value });
      }} />

      <div style={{ position: 'relative' }}>
        <OverlayLoader visible={loading && items.length > 0} />
        <table>
          {items.map(item => <tr key={item.id}>{item.name}</tr>)}
        </table>
      </div>

      <button onClick={() => setPage(page - 1)} disabled={page === 0}>
        Previous
      </button>
      <button onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  );
};
```

---

### 2. Form Submit Button

```tsx
import { ButtonLoader } from '@/components/common/Loaders';
import { useActionLoader } from '@/hooks';

const MyForm = () => {
  const { execute: save, loading: saving } = useActionLoader({
    actionFn: async (data) => await api.post('/save', data),
    onSuccess: () => alert('Saved!')
  });

  return (
    <ButtonLoader
      loading={saving}
      onClick={() => save(formData)}
      variant="primary"
    >
      Save
    </ButtonLoader>
  );
};
```

---

### 3. File Upload with Progress

```tsx
import { ProgressLoader } from '@/components/common/Loaders';
import { useUploadLoader } from '@/hooks';

const UploadComponent = () => {
  const { upload, progress, uploading } = useUploadLoader();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const result = await upload(file, '/upload');
    console.log('File URL:', result.url);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} disabled={uploading} />
      {uploading && <ProgressLoader progress={progress} message="Uploading..." />}
    </div>
  );
};
```

---

### 4. Delete Confirmation

```tsx
import { ButtonLoader } from '@/components/common/Loaders';
import { useActionLoader } from '@/hooks';

const DeleteButton = ({ itemId, onDeleted }) => {
  const { execute: deleteItem, loading: deleting } = useActionLoader({
    actionFn: (id) => api.delete(`/items/${id}`),
    onSuccess: () => {
      alert('Deleted!');
      onDeleted();
    }
  });

  return (
    <ButtonLoader
      loading={deleting}
      onClick={() => deleteItem(itemId)}
      variant="danger"
    >
      Delete
    </ButtonLoader>
  );
};
```

---

## What to Import

```tsx
// All loaders
import {
  Spinner,
  FullPageLoader,
  OverlayLoader,
  ButtonLoader,
  ProgressLoader,
  DotLoader
} from '@/components/common/Loaders';

// All hooks
import {
  useAsync,
  usePageLoader,
  useTableLoader,
  useActionLoader,
  useUploadLoader
} from '@/hooks';

// Context (optional)
import { LoadingProvider, useLoadingContext } from '@/context/LoadingContext';

// Utils (optional)
import { debounce, throttle, validateFileType } from '@/utils/loadingUtils';
```

---

## Key Rules to Remember

1. **Page Table Loader**
   - Use `useTableLoader` for all list pages
   - Show `FullPageLoader` when `loading && data?.length === 0`
   - Show `OverlayLoader` when `loading && data?.length > 0`

2. **Buttons**
   - Always use `ButtonLoader` for actions
   - Never use regular `<button>` with manual loading state

3. **File Uploads**
   - Always use `useUploadLoader`
   - Show `ProgressLoader` during upload

4. **Submissions**
   - Use `useActionLoader` for forms
   - Call `execute(data)` on submit

---

## Need More Details?

- **Full Documentation:** See `LOADER_SYSTEM_README.md`
- **Step-by-Step Migration:** See `MIGRATION_GUIDE.md`
- **Working Example:** See `Candidate.refactored.jsx`

---

**Created:** 2026-04-03
**Version:** 1.0.0
