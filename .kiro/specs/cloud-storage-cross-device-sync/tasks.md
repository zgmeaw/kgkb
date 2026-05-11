# Implementation Plan

## Overview

This implementation plan follows the exploratory bugfix workflow:
1. **Explore** - Write tests BEFORE fix to understand the bug (Bug Condition)
2. **Preserve** - Write tests for non-buggy behavior (Preservation Requirements)
3. **Implement** - Apply the fix with understanding (Expected Behavior)
4. **Validate** - Verify fix works and doesn't break anything

---

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Gist Data Restoration on New Device Login
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Test implementation details from Bug Condition in design:
    - Simulate Device A saving data (announcements, positions, profile) to Gist
    - Simulate Device B logging in with empty localStorage but existing Gist data
    - Assert that contexts should initialize with Gist data (not empty data)
  - The test assertions should match the Expected Behavior Properties from design:
    - `result.localStorageData = input.userGistData`
    - `result.contextsInitialized = true`
    - `result.dataDisplayed = input.userGistData`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause:
    - Example: "User has 10 announcements in Gist, but Device B shows 0 announcements"
    - Example: "User has 500 positions in Gist, but Device B shows 0 positions"
    - Example: "User has profile settings in Gist, but Device B shows default settings"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Immediate Local Saves and Offline Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - Test Case 1: User creates/edits/deletes announcements → observe immediate localStorage save
    - Test Case 2: User imports/modifies positions → observe immediate localStorage save
    - Test Case 3: User updates profile settings → observe immediate localStorage save
    - Test Case 4: Auto-backup service runs → observe Gist upload
    - Test Case 5: User works offline → observe localStorage-based functionality
    - Test Case 6: Cross-tab data modification → observe storage event synchronization
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - Property: For all user interactions that modify data (create, edit, delete), localStorage SHALL be updated immediately
    - Property: For all auto-backup triggers, data SHALL be uploaded to Gist
    - Property: For all offline scenarios, app SHALL function using localStorage
    - Property: For all cross-tab modifications, storage events SHALL synchronize data
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 3. Fix for cloud storage cross-device sync

  - [x] 3.1 Add cloud initialization method to cloudStorageService
    - Open `src/services/cloudStorageService.ts`
    - Add new public method `initializeFromCloud(password: string): Promise<boolean>`
    - Method logic:
      - Check if user is authenticated (return false if not)
      - Check if Gist data exists using `hasCloudData()`
      - If Gist data exists, download using `downloadData(password)`
      - Populate localStorage with downloaded data for all keys (announcements, positions, profile)
      - Return true on success, false on failure
    - Add error handling for network failures and decryption errors
    - Add support for progress callbacks or detailed status for UI loading indicators
    - _Bug_Condition: isBugCondition(input) where input.userGistData IS NOT NULL AND input.localStorageData IS NULL AND userIsAuthenticated() AND appIsInitializing()_
    - _Expected_Behavior: result.localStorageData = input.userGistData AND result.contextsInitialized = true AND result.dataDisplayed = input.userGistData_
    - _Preservation: Immediate saves to localStorage (3.1, 3.2, 3.3), auto-backup service (3.4), offline functionality (3.5), GistStorageBackend methods (3.6), logout behavior (3.7), React state updates (3.8)_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 3.2 Add app-level initialization logic
    - Open `src/App.tsx`
    - Add loading state management (useState for isLoadingCloudData)
    - After authentication succeeds, before rendering main app content:
      - Call `cloudStorageService.initializeFromCloud(userPassword)`
      - Show loading spinner while data is being fetched
      - Handle errors gracefully (network failures, decryption errors)
      - Fall back to localStorage if Gist fetch fails
    - Display loading indicator during cloud data restoration
    - Prevent contexts from rendering until cloud data is restored or fetch fails
    - _Bug_Condition: isBugCondition(input) where input.userGistData IS NOT NULL AND input.localStorageData IS NULL AND userIsAuthenticated() AND appIsInitializing()_
    - _Expected_Behavior: result.localStorageData = input.userGistData AND result.contextsInitialized = true AND result.dataDisplayed = input.userGistData_
    - _Preservation: Immediate saves to localStorage (3.1, 3.2, 3.3), auto-backup service (3.4), offline functionality (3.5), GistStorageBackend methods (3.6), logout behavior (3.7), React state updates (3.8)_
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 3.3 Add loading states and error handling UI
    - Create or update `src/components/common/CloudSyncButton.tsx` (or create new component)
    - Display loading indicators during cloud operations:
      - Show spinner during Gist fetch
      - Show progress for large data downloads
      - Show success/error messages after operations complete
    - Add error handling UI with user-friendly messages:
      - Network errors: "Unable to connect to cloud storage. Using cached data."
      - Decryption errors: "Incorrect password. Please try again."
      - API errors: "Cloud storage service unavailable. Using cached data."
    - _Bug_Condition: isBugCondition(input) where input.userGistData IS NOT NULL AND input.localStorageData IS NULL AND userIsAuthenticated() AND appIsInitializing()_
    - _Expected_Behavior: result.localStorageData = input.userGistData AND result.contextsInitialized = true AND result.dataDisplayed = input.userGistData_
    - _Preservation: Immediate saves to localStorage (3.1, 3.2, 3.3), auto-backup service (3.4), offline functionality (3.5), GistStorageBackend methods (3.6), logout behavior (3.7), React state updates (3.8)_
    - _Requirements: 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 3.4 Add pagination to PositionList.tsx
    - Open `src/pages/PositionList.tsx`
    - Implement pagination UI for position list:
      - Add page size selector (25, 50, 100 items per page)
      - Add page navigation controls (previous, next, page numbers)
      - Display total count and current range (e.g., "Showing 1-50 of 500")
      - Preserve filters when changing pages
    - Add state management for current page and page size
    - Calculate visible positions based on current page and page size
    - _Bug_Condition: isBugCondition(input) where input.userGistData IS NOT NULL AND input.localStorageData IS NULL AND userIsAuthenticated() AND appIsInitializing()_
    - _Expected_Behavior: result.localStorageData = input.userGistData AND result.contextsInitialized = true AND result.dataDisplayed = input.userGistData_
    - _Preservation: Immediate saves to localStorage (3.1, 3.2, 3.3), auto-backup service (3.4), offline functionality (3.5), GistStorageBackend methods (3.6), logout behavior (3.7), React state updates (3.8)_
    - _Requirements: 2.8, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Gist Data Restoration on New Device Login
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify that:
      - Device B now loads announcements from Gist (not empty)
      - Device B now loads positions from Gist (not empty)
      - Device B now loads profile settings from Gist (not default)
      - localStorage is populated with Gist data before contexts initialize
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Immediate Local Saves and Offline Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix:
      - Immediate localStorage saves for create/edit/delete operations
      - Auto-backup service continues to upload to Gist
      - Offline functionality continues to work
      - Cross-tab synchronization continues to work
      - GistStorageBackend methods continue to work correctly
      - Logout behavior continues to work correctly
      - React state updates continue to trigger correctly
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run all tests (bug condition exploration test + preservation tests)
  - Verify bug condition test now passes (confirms fix works)
  - Verify preservation tests still pass (confirms no regressions)
  - Test full integration flow:
    - Device A saves data → data backs up to Gist → Device B logs in → data loads from Gist → contexts display data
  - Test cache clear flow:
    - User has data → clears browser cache → logs in again → data restores from Gist
  - Test error recovery flow:
    - Gist fetch fails → user sees cached data → network recovers → user manually syncs → data updates
  - Test pagination flow:
    - User imports 1000 positions → pagination displays 50 per page → user navigates pages → filters work correctly
  - Ensure all tests pass, ask the user if questions arise

---

## Notes

- **Bug Condition**: The bug occurs when `input.userGistData IS NOT NULL AND input.localStorageData IS NULL AND userIsAuthenticated() AND appIsInitializing()`
- **Expected Behavior**: After fix, `result.localStorageData = input.userGistData AND result.contextsInitialized = true AND result.dataDisplayed = input.userGistData`
- **Preservation**: All user interactions, auto-backup, offline functionality, and cross-tab sync must continue to work exactly as before
- **Testing Strategy**: Exploration test (Task 1) will FAIL on unfixed code, then PASS after fix. Preservation tests (Task 2) will PASS on both unfixed and fixed code.
