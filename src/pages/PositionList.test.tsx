/**
 * Tests for PositionList pagination functionality
 * Task 3.4: Add pagination to PositionList.tsx
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PositionList } from './PositionList';
import * as fc from 'fast-check';
import { Position } from '@/types';

// Mock dependencies
vi.mock('@/components/Layout', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/common', () => ({
  Button: ({ children, onClick, disabled, fullWidth, variant, size }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
  Input: ({ value, onChange, placeholder, fullWidth }: any) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  ),
  Select: ({ value, onChange, options, fullWidth }: any) => (
    <select value={value} onChange={onChange}>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  Loading: ({ text }: any) => <div>{text}</div>,
}));

vi.mock('@/components/position', () => ({
  PositionCard: ({ position }: { position: Position }) => (
    <div data-testid={`position-${position.id}`}>{position.name}</div>
  ),
  ExcelUploader: () => <div>Excel Uploader</div>,
}));

vi.mock('@/hooks', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('@/services', () => ({
  matchingService: {
    calculateBatchMatchingScores: (positions: Position[]) => positions,
  },
}));

// Mock contexts
const mockPositions: Position[] = [];
const mockFilterPositions = vi.fn((filters: any) => mockPositions);

vi.mock('@/contexts', () => ({
  usePositions: () => ({
    positions: mockPositions,
    addPositions: vi.fn(),
    filterPositions: mockFilterPositions,
  }),
  useAnnouncements: () => ({
    announcements: [],
  }),
  useUserProfile: () => ({
    userProfile: null,
  }),
}));

describe('PositionList Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPositions.length = 0;
  });

  describe('Unit Tests - Pagination UI', () => {
    it('should display page size selector with options 25, 50, 100', () => {
      // Create 100 positions to trigger pagination
      const positions = Array.from({ length: 100 }, (_, i) => ({
        id: `pos-${i}`,
        name: `Position ${i}`,
        code: `CODE${i}`,
        department: 'Test Dept',
        announcementId: 'ann-1',
        requirements: {},
      }));
      mockPositions.push(...positions);
      mockFilterPositions.mockReturnValue(positions);

      render(<PositionList />);

      // Check for page size selector
      const pageSizeSelects = screen.getAllByRole('combobox');
      const pageSizeSelect = pageSizeSelects.find((select) => {
        const options = Array.from(select.querySelectorAll('option'));
        return options.some((opt) => opt.textContent === '25 条');
      });

      expect(pageSizeSelect).toBeDefined();
      const options = Array.from(pageSizeSelect!.querySelectorAll('option'));
      expect(options.map((opt) => opt.textContent)).toEqual(['25 条', '50 条', '100 条']);
    });

    it('should display page navigation controls (previous, next, page numbers)', () => {
      // Create 150 positions to have multiple pages
      const positions = Array.from({ length: 150 }, (_, i) => ({
        id: `pos-${i}`,
        name: `Position ${i}`,
        code: `CODE${i}`,
        department: 'Test Dept',
        announcementId: 'ann-1',
        requirements: {},
      }));
      mockPositions.push(...positions);
      mockFilterPositions.mockReturnValue(positions);

      render(<PositionList />);

      // Check for navigation buttons
      expect(screen.getByText('上一页')).toBeDefined();
      expect(screen.getByText('下一页')).toBeDefined();

      // Check for page numbers (should show page 1, 2, 3 at minimum)
      expect(screen.getByText('1')).toBeDefined();
      expect(screen.getByText('2')).toBeDefined();
      expect(screen.getByText('3')).toBeDefined();
    });

    it('should display total count and current range', () => {
      const positions = Array.from({ length: 75 }, (_, i) => ({
        id: `pos-${i}`,
        name: `Position ${i}`,
        code: `CODE${i}`,
        department: 'Test Dept',
        announcementId: 'ann-1',
        requirements: {},
      }));
      mockPositions.push(...positions);
      mockFilterPositions.mockReturnValue(positions);

      render(<PositionList />);

      // Check for total count
      expect(screen.getByText(/共 75 个岗位/)).toBeDefined();
      // Check for current range (default page size is 50)
      expect(screen.getByText(/显示 1-50 条/)).toBeDefined();
    });

    it('should disable previous button on first page', () => {
      const positions = Array.from({ length: 100 }, (_, i) => ({
        id: `pos-${i}`,
        name: `Position ${i}`,
        code: `CODE${i}`,
        department: 'Test Dept',
        announcementId: 'ann-1',
        requirements: {},
      }));
      mockPositions.push(...positions);
      mockFilterPositions.mockReturnValue(positions);

      render(<PositionList />);

      const prevButton = screen.getByText('上一页');
      expect(prevButton.hasAttribute('disabled')).toBe(true);
    });

    it('should disable next button on last page', () => {
      const positions = Array.from({ length: 100 }, (_, i) => ({
        id: `pos-${i}`,
        name: `Position ${i}`,
        code: `CODE${i}`,
        department: 'Test Dept',
        announcementId: 'ann-1',
        requirements: {},
      }));
      mockPositions.push(...positions);
      mockFilterPositions.mockReturnValue(positions);

      render(<PositionList />);

      // Navigate to last page (page 2)
      const nextButton = screen.getByText('下一页');
      fireEvent.click(nextButton);

      // Now on last page, next button should be disabled
      expect(nextButton.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('Unit Tests - Pagination Behavior', () => {
    it('should display correct positions for current page', () => {
      const positions = Array.from({ length: 100 }, (_, i) => ({
        id: `pos-${i}`,
        name: `Position ${i}`,
        code: `CODE${i}`,
        department: 'Test Dept',
        announcementId: 'ann-1',
        requirements: {},
      }));
      mockPositions.push(...positions);
      mockFilterPositions.mockReturnValue(positions);

      render(<PositionList />);

      // Default page size is 50, so first 50 positions should be visible
      expect(screen.getByTestId('position-pos-0')).toBeDefined();
      expect(screen.getByTestId('position-pos-49')).toBeDefined();
      expect(screen.queryByTestId('position-pos-50')).toBeNull();
    });

    it('should navigate to next page when next button is clicked', async () => {
      const positions = Array.from({ length: 100 }, (_, i) => ({
        id: `pos-${i}`,
        name: `Position ${i}`,
        code: `CODE${i}`,
        department: 'Test Dept',
        announcementId: 'ann-1',
        requirements: {},
      }));
      mockPositions.push(...positions);
      mockFilterPositions.mockReturnValue(positions);

      render(<PositionList />);

      const nextButton = screen.getByText('下一页');
      fireEvent.click(nextButton);

      await waitFor(() => {
        // Should now show positions 50-99
        expect(screen.getByTestId('position-pos-50')).toBeDefined();
        expect(screen.getByTestId('position-pos-99')).toBeDefined();
        expect(screen.queryByTestId('position-pos-0')).toBeNull();
      });
    });

    it('should navigate to previous page when previous button is clicked', async () => {
      const positions = Array.from({ length: 100 }, (_, i) => ({
        id: `pos-${i}`,
        name: `Position ${i}`,
        code: `CODE${i}`,
        department: 'Test Dept',
        announcementId: 'ann-1',
        requirements: {},
      }));
      mockPositions.push(...positions);
      mockFilterPositions.mockReturnValue(positions);

      render(<PositionList />);

      // Go to page 2
      const nextButton = screen.getByText('下一页');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('position-pos-50')).toBeDefined();
      });

      // Go back to page 1
      const prevButton = screen.getByText('上一页');
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getByTestId('position-pos-0')).toBeDefined();
        expect(screen.queryByTestId('position-pos-50')).toBeNull();
      });
    });

    it('should change page size and reset to page 1', async () => {
      const positions = Array.from({ length: 100 }, (_, i) => ({
        id: `pos-${i}`,
        name: `Position ${i}`,
        code: `CODE${i}`,
        department: 'Test Dept',
        announcementId: 'ann-1',
        requirements: {},
      }));
      mockPositions.push(...positions);
      mockFilterPositions.mockReturnValue(positions);

      render(<PositionList />);

      // Go to page 2
      const nextButton = screen.getByText('下一页');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('position-pos-50')).toBeDefined();
      });

      // Change page size to 25
      const pageSizeSelects = screen.getAllByRole('combobox');
      const pageSizeSelect = pageSizeSelects.find((select) => {
        const options = Array.from(select.querySelectorAll('option'));
        return options.some((opt) => opt.textContent === '25 条');
      });

      fireEvent.change(pageSizeSelect!, { target: { value: '25' } });

      await waitFor(() => {
        // Should reset to page 1 and show first 25 positions
        expect(screen.getByTestId('position-pos-0')).toBeDefined();
        expect(screen.getByTestId('position-pos-24')).toBeDefined();
        expect(screen.queryByTestId('position-pos-25')).toBeNull();
      });
    });

    it('should preserve filters when changing pages', async () => {
      const positions = Array.from({ length: 100 }, (_, i) => ({
        id: `pos-${i}`,
        name: `Position ${i}`,
        code: `CODE${i}`,
        department: 'Test Dept',
        announcementId: 'ann-1',
        requirements: {},
      }));
      mockPositions.push(...positions);
      mockFilterPositions.mockReturnValue(positions);

      render(<PositionList />);

      // Apply a filter
      const searchInput = screen.getByPlaceholderText('搜索岗位名称、部门或代码');
      fireEvent.change(searchInput, { target: { value: 'Position' } });

      // Navigate to page 2
      const nextButton = screen.getByText('下一页');
      fireEvent.click(nextButton);

      await waitFor(() => {
        // Filter should still be applied
        expect(searchInput).toHaveValue('Position');
        expect(mockFilterPositions).toHaveBeenCalled();
      });
    });

    it('should reset to page 1 when filters change', async () => {
      const positions = Array.from({ length: 100 }, (_, i) => ({
        id: `pos-${i}`,
        name: `Position ${i}`,
        code: `CODE${i}`,
        department: 'Test Dept',
        announcementId: 'ann-1',
        requirements: {},
      }));
      mockPositions.push(...positions);
      mockFilterPositions.mockReturnValue(positions);

      render(<PositionList />);

      // Go to page 2
      const nextButton = screen.getByText('下一页');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('position-pos-50')).toBeDefined();
      });

      // Change filter
      const searchInput = screen.getByPlaceholderText('搜索岗位名称、部门或代码');
      fireEvent.change(searchInput, { target: { value: 'Test' } });

      await waitFor(() => {
        // Should reset to page 1
        expect(screen.getByText(/第 1 \//)).toBeDefined();
      });
    });
  });

  describe('Property-Based Tests - Pagination Calculations', () => {
    it('should correctly calculate visible positions for any page and page size', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }), // total items
          fc.integer({ min: 1, max: 10 }), // current page
          fc.constantFrom(25, 50, 100), // page size
          (totalItems, currentPage, pageSize) => {
            const totalPages = Math.ceil(totalItems / pageSize);
            const validPage = Math.min(currentPage, totalPages);
            const startIndex = (validPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, totalItems);
            const visibleCount = endIndex - startIndex;

            // Properties that should always hold:
            // 1. Start index should be within bounds
            expect(startIndex).toBeGreaterThanOrEqual(0);
            expect(startIndex).toBeLessThan(totalItems);

            // 2. End index should be within bounds
            expect(endIndex).toBeGreaterThan(0);
            expect(endIndex).toBeLessThanOrEqual(totalItems);

            // 3. Visible count should not exceed page size
            expect(visibleCount).toBeLessThanOrEqual(pageSize);

            // 4. Visible count should be positive
            expect(visibleCount).toBeGreaterThan(0);

            // 5. On last page, visible count may be less than page size
            if (validPage === totalPages) {
              const remainder = totalItems % pageSize;
              if (remainder > 0) {
                expect(visibleCount).toBe(remainder);
              } else {
                expect(visibleCount).toBe(pageSize);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly calculate total pages for any total items and page size', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }), // total items
          fc.constantFrom(25, 50, 100), // page size
          (totalItems, pageSize) => {
            const totalPages = Math.ceil(totalItems / pageSize);

            // Properties that should always hold:
            // 1. Total pages should be non-negative
            expect(totalPages).toBeGreaterThanOrEqual(0);

            // 2. If there are items, there should be at least 1 page
            if (totalItems > 0) {
              expect(totalPages).toBeGreaterThanOrEqual(1);
            }

            // 3. Total pages should not exceed items (each page has at least 1 item)
            expect(totalPages).toBeLessThanOrEqual(totalItems);

            // 4. All items should fit within total pages
            expect(totalPages * pageSize).toBeGreaterThanOrEqual(totalItems);

            // 5. Total pages should be minimal (removing one page would not fit all items)
            if (totalPages > 0) {
              expect((totalPages - 1) * pageSize).toBeLessThan(totalItems);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge cases: empty list, single item, exact page size multiples', () => {
      const testCases = [
        { totalItems: 0, pageSize: 50, expectedPages: 0 },
        { totalItems: 1, pageSize: 50, expectedPages: 1 },
        { totalItems: 50, pageSize: 50, expectedPages: 1 },
        { totalItems: 51, pageSize: 50, expectedPages: 2 },
        { totalItems: 100, pageSize: 50, expectedPages: 2 },
        { totalItems: 101, pageSize: 50, expectedPages: 3 },
        { totalItems: 25, pageSize: 25, expectedPages: 1 },
        { totalItems: 100, pageSize: 25, expectedPages: 4 },
      ];

      testCases.forEach(({ totalItems, pageSize, expectedPages }) => {
        const totalPages = Math.ceil(totalItems / pageSize);
        expect(totalPages).toBe(expectedPages);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty position list', () => {
      mockFilterPositions.mockReturnValue([]);

      render(<PositionList />);

      expect(screen.getByText('暂无岗位数据')).toBeDefined();
      expect(screen.queryByText('上一页')).toBeNull();
      expect(screen.queryByText('下一页')).toBeNull();
    });

    it('should handle single page of positions (no pagination controls)', () => {
      const positions = Array.from({ length: 10 }, (_, i) => ({
        id: `pos-${i}`,
        name: `Position ${i}`,
        code: `CODE${i}`,
        department: 'Test Dept',
        announcementId: 'ann-1',
        requirements: {},
      }));
      mockPositions.push(...positions);
      mockFilterPositions.mockReturnValue(positions);

      render(<PositionList />);

      // With only 10 items and page size 50, pagination controls should not appear
      expect(screen.queryByText('上一页')).toBeNull();
      expect(screen.queryByText('下一页')).toBeNull();
    });

    it('should handle exactly page size items', () => {
      const positions = Array.from({ length: 50 }, (_, i) => ({
        id: `pos-${i}`,
        name: `Position ${i}`,
        code: `CODE${i}`,
        department: 'Test Dept',
        announcementId: 'ann-1',
        requirements: {},
      }));
      mockPositions.push(...positions);
      mockFilterPositions.mockReturnValue(positions);

      render(<PositionList />);

      // Should show all 50 items on page 1
      expect(screen.getByTestId('position-pos-0')).toBeDefined();
      expect(screen.getByTestId('position-pos-49')).toBeDefined();
      // No pagination controls since it's exactly one page
      expect(screen.queryByText('上一页')).toBeNull();
    });

    it('should handle large datasets efficiently', () => {
      const positions = Array.from({ length: 10000 }, (_, i) => ({
        id: `pos-${i}`,
        name: `Position ${i}`,
        code: `CODE${i}`,
        department: 'Test Dept',
        announcementId: 'ann-1',
        requirements: {},
      }));
      mockPositions.push(...positions);
      mockFilterPositions.mockReturnValue(positions);

      render(<PositionList />);

      // Should only render visible positions (50 by default)
      const renderedPositions = screen.getAllByTestId(/^position-pos-/);
      expect(renderedPositions.length).toBe(50);

      // Should show correct page info
      expect(screen.getByText(/共 10000 个岗位/)).toBeDefined();
      expect(screen.getByText(/显示 1-50 条/)).toBeDefined();
    });
  });
});
