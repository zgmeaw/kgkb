# Implementation Plan

## Overview

本实现计划遵循 bugfix workflow 的探索-保留-实现-验证方法：
1. **探索阶段**: 编写 Bug Condition 测试，在未修复代码上运行以暴露 QuotaExceededError
2. **保留阶段**: 编写 Preservation 测试，验证小数据集的现有行为
3. **实现阶段**: 应用修复，实现智能存储策略和降级机制
4. **验证阶段**: 确认所有测试通过，bug 已修复且无回归

---

## Task 1: Write Bug Condition Exploration Test

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Large Dataset QuotaExceededError
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate QuotaExceededError occurs with large datasets
  - **Scoped PBT Approach**: Scope the property to concrete failing cases: 1000+ position records (>4MB data)
  
  **Test Implementation Details:**
  - Create test file: `src/services/__tests__/storageService.quotaExceeded.test.ts`
  - Mock `localStorage.setItem()` to throw `QuotaExceededError` when data size exceeds 5MB
  - Generate test data: 1500 position records (approximately 6MB when serialized)
  - Test that `storageService.set('positions', largeDataset)` fails on UNFIXED code
  - Assert that QuotaExceededError is thrown or `set()` returns false
  - Document counterexamples found (e.g., "1500 records cause QuotaExceededError, data not saved")
  
  **Bug Condition from Design:**
  ```
  isBugCondition(input) WHERE:
    input.dataSize + input.localStorageUsed > input.localStorageQuota
    AND input.attemptingLocalStorage === true
  ```
  
  **Expected Behavior Properties (will validate after fix):**
  - System automatically detects large dataset (>4MB)
  - System skips localStorage and saves directly to cloud storage (R2)
  - System displays user-friendly message: "数据量较大，已保存到云端存储"
  - Data is successfully persisted and recoverable after page refresh
  - No QuotaExceededError is thrown
  
  **Test Scenarios:**
  1. **Large Dataset (1500 records, ~6MB)**: Expect FAILURE on unfixed code
  2. **Boundary Case (1000 records, ~4.5MB)**: Expect FAILURE when localStorage has 1MB used
  3. **Quota Full Scenario**: Fill localStorage to 4.5MB, then try to add 1MB → Expect FAILURE
  
  **Run test on UNFIXED code:**
  ```bash
  npm test -- storageService.quotaExceeded.test.ts
  ```
  
  **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - QuotaExceededError is thrown
  - `storageService.set()` returns false
  - No automatic fallback to cloud storage
  - No user-friendly error message
  
  Mark task complete when test is written, run, and failure is documented
  
  _Requirements: 1.1, 1.2, 1.3, 1.4_

---

## Task 2: Write Preservation Property Tests

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Small Dataset LocalStorage Caching
  - **IMPORTANT**: Follow observation-first methodology
  - **GOAL**: Ensure small datasets continue using localStorage caching after fix
  
  **Observation Phase (on UNFIXED code):**
  - Observe: Saving 10 announcement records (~50KB) uses localStorage + cloud backup
  - Observe: Saving user profile (~5KB) uses localStorage caching
  - Observe: Saving 50 position records (~200KB) uses localStorage + cloud dual-write
  - Observe: Cross-tab sync via storage events works for small datasets
  - Observe: Auto-backup continues to work for small datasets
  
  **Test Implementation Details:**
  - Create test file: `src/services/__tests__/storageService.preservation.test.ts`
  - Use property-based testing to generate small datasets (10-100 records, <1MB)
  - Test that `storageService.set()` successfully writes to localStorage
  - Test that data is retrievable via `storageService.get()`
  - Test that storage events are triggered for cross-tab sync
  - Verify tests PASS on UNFIXED code (confirms baseline behavior)
  
  **Preservation Requirements from Design:**
  ```
  FOR ALL input WHERE NOT isBugCondition(input):
    - Small datasets (<4MB) continue using localStorage caching
    - Announcements, user profiles, small position lists unchanged
    - Cross-tab sync via storage events continues working
    - Auto-backup functionality continues working
    - Gist backend continues working normally
  ```
  
  **Property-Based Test Cases:**
  1. **Small Announcements (10-50 records, 50KB-250KB)**: 
     - Generate random announcement data
     - Assert localStorage.setItem() is called
     - Assert data is cached and retrievable
     - Assert cloud backup is also triggered
  
  2. **User Profile (1 record, ~5KB)**:
     - Generate random user profile data
     - Assert localStorage caching works
     - Assert data persists across page refresh
  
  3. **Small Position Lists (10-100 records, 50KB-500KB)**:
     - Generate random position data below threshold
     - Assert localStorage + cloud dual-write
     - Assert fast access from localStorage cache
  
  4. **Cross-Tab Sync**:
     - Simulate storage event from another tab
     - Assert data is synchronized via localStorage
     - Assert behavior unchanged from original system
  
  5. **Auto-Backup**:
     - Trigger auto-backup for small dataset
     - Assert backup uploads to cloud
     - Assert localStorage cache remains intact
  
  **Run tests on UNFIXED code:**
  ```bash
  npm test -- storageService.preservation.test.ts
  ```
  
  **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - localStorage.setItem() succeeds for small datasets
  - Data is cached and quickly retrievable
  - Cross-tab sync works via storage events
  - Auto-backup continues working
  
  Mark task complete when tests are written, run, and passing on unfixed code
  
  _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

---

## Task 3: Implement Fix for localStorage QuotaExceededError

- [ ] 3. Fix for localStorage QuotaExceededError

  - [x] 3.1 Add data size estimation and quota detection to storageService
    - **File**: `src/services/storageService.ts`
    - Add constant: `const STORAGE_SIZE_THRESHOLD = 4 * 1024 * 1024` (4MB)
    - Add method: `estimateDataSize(value: any): number`
      - Use `JSON.stringify(value).length * 2` to estimate bytes (UTF-16 encoding)
      - Return estimated data size in bytes
    - Add method: `getAvailableSpace(): number`
      - Calculate localStorage used space via existing `getSize()` method
      - Assume quota is 5MB (5 * 1024 * 1024 bytes)
      - Return available space: `quota - usedSpace`
    - Modify `set()` method to add pre-check logic:
      - Call `estimateDataSize()` before attempting localStorage write
      - Call `getAvailableSpace()` to check if space is sufficient
      - If `dataSize > availableSpace`, return error object: `{ success: false, reason: 'quota_exceeded', dataSize }`
      - If `dataSize > STORAGE_SIZE_THRESHOLD`, return error object: `{ success: false, reason: 'size_threshold_exceeded', dataSize }`
    - Improve QuotaExceededError handling in catch block:
      - Explicitly check `error.name === 'QuotaExceededError'`
      - Return error object with detailed info: `{ success: false, reason: 'quota_exceeded_error', error }`
      - Log detailed error: data size, used space, quota limit
    
    _Bug_Condition: `isBugCondition(input)` where `input.dataSize + input.localStorageUsed > input.localStorageQuota AND input.attemptingLocalStorage === true`_
    
    _Expected_Behavior: System detects quota issues before attempting write, returns structured error for graceful handling_
    
    _Preservation: Small datasets (<4MB) continue normal localStorage writes without triggering pre-check errors_
    
    _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.5_

  - [x] 3.2 Add skipLocalStorage option to useLocalStorage hook
    - **File**: `src/hooks/useLocalStorage.ts`
    - Modify hook signature: `useLocalStorage<T>(key: string, initialValue: T, options?: { skipLocalStorage?: boolean })`
    - When `options.skipLocalStorage === true`:
      - Skip `storageService.get()` during initialization
      - Use only in-memory state (React useState)
      - Skip `storageService.set()` in setValue function
      - Disable storage event listener (no cross-tab sync via localStorage)
    - Add data size detection in `setValue`:
      - Import `STORAGE_SIZE_THRESHOLD` from storageService
      - Call `storageService.estimateDataSize(newValue)` before saving
      - If `dataSize > STORAGE_SIZE_THRESHOLD`, automatically set `skipLocalStorage = true`
      - Display toast: "数据量较大，已保存到云端存储"
    - Improve error handling in setValue:
      - Check if error reason is 'quota_exceeded' or 'quota_exceeded_error'
      - Display user-friendly toast: "存储空间不足，已自动切换到云端存储"
      - Automatically retry with `skipLocalStorage = true`
      - Ensure data is saved to cloud even if localStorage fails
    
    _Bug_Condition: Large datasets trigger quota errors in localStorage_
    
    _Expected_Behavior: Hook automatically skips localStorage for large datasets, saves to cloud, notifies user_
    
    _Preservation: Small datasets continue using localStorage caching with fast access_
    
    _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2_

  - [x] 3.3 Enable R2 storage backend as default
    - **File**: `src/services/cloudStorageService.ts`
    - Modify `initBackend()` method:
      - Change default backend from `StorageBackendType.GITHUB_GIST` to `StorageBackendType.CLOUDFLARE_R2`
      - Update code: `const backendType = (import.meta.env.VITE_STORAGE_BACKEND as StorageBackendType) || StorageBackendType.CLOUDFLARE_R2;`
    - Add fallback logic for R2 configuration:
      - Check if R2 config is complete (VITE_R2_WORKER_URL and VITE_R2_API_KEY)
      - If R2 config is missing, fallback to Gist backend
      - Log warning: "R2 配置不完整，回退到 Gist 后端"
      - Ensure graceful degradation without throwing errors
    - Verify R2StorageBackend handles large datasets:
      - Review `src/services/storageBackends/r2StorageBackend.ts`
      - Ensure `save()` method can handle >4MB payloads
      - Ensure `load()` method can retrieve large datasets
    
    _Bug_Condition: Large datasets need robust cloud storage without API limits_
    
    _Expected_Behavior: R2 backend handles large datasets efficiently, fallback to Gist if R2 unavailable_
    
    _Preservation: Gist backend continues working when explicitly configured_
    
    _Requirements: 2.1, 2.4, 3.3_

  - [x] 3.4 Add intelligent storage strategy to PositionContext
    - **File**: `src/contexts/PositionContext.tsx`
    - Modify `PositionProvider` component:
      - Import `STORAGE_SIZE_THRESHOLD` from storageService
      - Add state: `const [useCloudOnly, setUseCloudOnly] = useState(false)`
    - Modify `addPositions` method:
      - Calculate total position count after adding new positions
      - Estimate data size: `storageService.estimateDataSize(updatedPositions)`
      - If `dataSize > STORAGE_SIZE_THRESHOLD` or `positionCount > 500`:
        - Set `useCloudOnly = true`
        - Display toast: `检测到大量岗位数据（${positionCount} 条），将使用云端存储以避免浏览器限制`
      - Pass `skipLocalStorage: useCloudOnly` to useLocalStorage hook
    - Add dynamic storage strategy:
      - <100 records: localStorage + cloud dual-write
      - 100-500 records: Check data size, decide dynamically
      - >500 records: Skip localStorage, cloud-only
    - Ensure cloud sync is triggered even when localStorage is skipped
    
    _Bug_Condition: Large position datasets trigger quota errors_
    
    _Expected_Behavior: Context automatically switches to cloud-only storage for large datasets, notifies user_
    
    _Preservation: Small position lists continue using localStorage caching_
    
    _Requirements: 1.1, 2.1, 2.2, 2.5, 3.1_

  - [x] 3.5 Update environment configuration documentation
    - **File**: `.env.example`
    - Add R2 configuration section:
      ```
      # 存储后端选择 (gist 或 r2)
      # 推荐使用 r2 以支持大数据集（1000+ 条岗位记录）
      VITE_STORAGE_BACKEND=r2
      
      # Cloudflare R2 配置（当使用 r2 后端时需要）
      VITE_R2_WORKER_URL=https://your-worker.your-subdomain.workers.dev
      VITE_R2_API_KEY=your-api-key-here
      
      # GitHub Gist 配置（当使用 gist 后端时需要）
      VITE_GITHUB_TOKEN=your-github-token-here
      ```
    - Add configuration guidance comments:
      - R2: 适合大数据集（1000+ 条记录），无 API 限制，需要 Cloudflare 账号
      - Gist: 适合小数据集（<500 条记录），依赖 GitHub，有 API 速率限制
      - 如果 R2 配置缺失，系统会自动回退到 Gist 后端
    
    _Requirements: 2.1, 3.3_

  - [~] 3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Large Dataset Auto Cloud Storage
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    
    **Run test on FIXED code:**
    ```bash
    npm test -- storageService.quotaExceeded.test.ts
    ```
    
    **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Large datasets (>4MB) automatically skip localStorage
    - System saves directly to cloud storage (R2)
    - No QuotaExceededError is thrown
    - User sees friendly message: "数据量较大，已保存到云端存储"
    - Data is recoverable after page refresh from cloud
    
    **Validation Criteria:**
    - All test scenarios from task 1 now pass
    - 1500 records saved successfully to cloud
    - Boundary case (1000 records) handled gracefully
    - Quota full scenario triggers automatic cloud fallback
    
    _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [~] 3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Small Dataset LocalStorage Caching
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    
    **Run tests on FIXED code:**
    ```bash
    npm test -- storageService.preservation.test.ts
    ```
    
    **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Small datasets (<4MB) continue using localStorage caching
    - Announcements, user profiles saved to localStorage + cloud
    - Cross-tab sync via storage events still works
    - Auto-backup continues working normally
    - Gist backend continues working when configured
    
    **Validation Criteria:**
    - All property-based tests from task 2 pass
    - Small announcements (10-50 records) use localStorage
    - User profile caching unchanged
    - Small position lists (10-100 records) use dual-write
    - Cross-tab sync behavior preserved
    - Auto-backup functionality unchanged
    
    Confirm all tests still pass after fix (no regressions)
    
    _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

---

## Task 4: Checkpoint - Ensure All Tests Pass

- [~] 4. Checkpoint - Ensure all tests pass
  - Run full test suite: `npm test`
  - Verify all unit tests pass:
    - `storageService.quotaExceeded.test.ts` (Bug Condition - should PASS after fix)
    - `storageService.preservation.test.ts` (Preservation - should PASS)
    - Any existing storageService tests (should continue passing)
  - Verify integration tests pass:
    - Test large dataset import flow: Excel upload → parse → save to R2 → refresh → recover
    - Test small dataset flow: Create announcement → save to localStorage + cloud → cross-tab sync
    - Test storage backend switching: Gist → R2, verify data migration
  - Manual testing checklist:
    - [~] Import 1500 position records, verify saved to cloud with user notification
    - [~] Refresh page, verify data recovered from R2
    - [~] Import 50 position records, verify saved to localStorage + cloud
    - [~] Open multiple tabs, verify small data syncs via localStorage
    - [~] Check browser console for no QuotaExceededError
    - [~] Verify auto-backup works for both small and large datasets
  - If any test fails, investigate root cause and fix before proceeding
  - Document any edge cases or unexpected behaviors found
  - Ensure all tests pass, ask the user if questions arise

---

## Summary

This implementation plan follows the bugfix workflow methodology:

1. **Exploration (Task 1)**: Write Bug Condition test that FAILS on unfixed code, exposing QuotaExceededError
2. **Preservation (Task 2)**: Write Preservation tests that PASS on unfixed code, capturing baseline behavior for small datasets
3. **Implementation (Task 3)**: Apply fix with intelligent storage strategy, quota detection, and R2 backend
4. **Validation (Task 4)**: Verify Bug Condition test now PASSES and Preservation tests still PASS

**Key Validation Points:**
- Bug Condition test transitions from FAIL → PASS after fix
- Preservation tests remain PASS before and after fix
- No regressions in existing functionality
- User experience improved with friendly notifications
