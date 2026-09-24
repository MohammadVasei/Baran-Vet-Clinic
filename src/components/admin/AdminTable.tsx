"use client";

import { useState, useMemo } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, SearchIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ColumnDef<T> {
  accessorKey?: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  cellWithMeta?: (meta: { getValue: (key: string) => unknown; original: T }) => React.ReactNode;
  id?: string;
}

interface AdminTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onCreate?: () => void;
  createLabel?: string;
  isLoading?: boolean;
  error?: string;
  searchKey?: keyof T | ((row: T) => string);
}

type SortingState = { id: string; desc: boolean }[];
type PaginationState = { pageIndex: number; pageSize: number };

function createSortComparator<T>(key: keyof T, desc: boolean) {
  return (a: T, b: T) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal === bVal) return 0;
    const result = aVal > bVal ? 1 : -1;
    return desc ? -result : result;
  };
}

function filterData<T>(data: T[], globalFilter: string, searchKey?: keyof T | ((row: T) => string)): T[] {
  if (!globalFilter) return data;
  const filter = globalFilter.toLowerCase();
  return data.filter((row) => {
    if (typeof searchKey === 'function') {
      return searchKey(row).toLowerCase().includes(filter);
    }
    if (searchKey) {
      const val = row[searchKey];
      return String(val).toLowerCase().includes(filter);
    }
    return Object.values(row as Record<string, unknown>).some((val) => String(val).toLowerCase().includes(filter));
  });
}

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  onCreate,
  createLabel = 'افزودن',
  isLoading = false,
  error,
  searchKey,
}: AdminTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState('');

  const filteredData = useMemo(() => filterData(data, globalFilter, searchKey), [data, globalFilter, searchKey]);

  const sortedData = useMemo(() => {
    if (sorting.length === 0) return filteredData;
    const { id, desc } = sorting[0];
    return [...filteredData].sort(createSortComparator(id as keyof T, desc));
  }, [filteredData, sorting]);

  const pageCount = Math.max(1, Math.ceil(sortedData.length / pagination.pageSize));
  const paginatedData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return sortedData.slice(start, start + pagination.pageSize);
  }, [sortedData, pagination]);

  const handleSort = (columnId: string) => {
    setSorting((prev) => {
      const existing = prev.find((s) => s.id === columnId);
      if (existing) {
        if (existing.desc) {
          return prev.filter((s) => s.id !== columnId);
        }
        return prev.map((s) => (s.id === columnId ? { ...s, desc: true } : s));
      }
      return [{ id: columnId, desc: false }, ...prev.filter((s) => s.id !== columnId)];
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="rounded-app-lg border border-border bg-surface overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-border">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="جستجو..."
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="pl-10 pr-4 py-2"
              aria-label="جستجو در جدول"
            />
          </div>
          {onCreate && (
            <Button onClick={onCreate} className="whitespace-nowrap">
              <PlusIcon className="size-4" />
              {createLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              {columns.map((column, colIndex) => (
                <th
                  key={`${String(column.id || column.accessorKey || column.header)}-${colIndex}`}
                  className="px-4 py-3 text-right text-sm font-semibold text-foreground"
                  aria-sort={
                    column.accessorKey && sorting.find((s) => s.id === column.accessorKey)
                      ? sorting.find((s) => s.id === column.accessorKey)!.desc
                        ? 'descending'
                        : 'ascending'
                      : column.accessorKey
                        ? 'none'
                        : undefined
                  }
                >
                  {column.accessorKey ? (
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center gap-2 rounded-sm text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={() => handleSort(column.accessorKey as string)}
                      aria-label={`مرتب‌سازی بر اساس ${column.header}`}
                    >
                      {column.header}
                      {sorting.find((s) => s.id === column.accessorKey) && (
                        <span className="inline-flex">
                          {sorting.find((s) => s.id === column.accessorKey)!.desc ? (
                            <ChevronUpIcon className="size-4 text-primary" />
                          ) : (
                            <ChevronDownIcon className="size-4 text-primary" />
                          )}
                        </span>
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  در حال بارگذاری...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-destructive">
                  {error}
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  هیچ موردی یافت نشد
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                  {columns.map((column, colIndex) => (
                    <td
                      key={`${String(column.id || column.accessorKey || column.header)}-${colIndex}`}
                      className="px-4 py-3 text-sm text-foreground"
                    >
                      {column.cellWithMeta
                        ? column.cellWithMeta({
                            getValue: (key: string) => row[key as keyof T],
                            original: row,
                          })
                        : column.cell
                        ? column.cell(row)
                        : (row[column.accessorKey as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {sortedData.length === 0 ? 'صفحه‌ای وجود ندارد' : `صفحه ${pagination.pageIndex + 1} از ${pageCount}`}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
            disabled={pagination.pageIndex === 0}
            aria-label="صفحه قبلی"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
            disabled={pagination.pageIndex >= pageCount - 1}
            aria-label="صفحه بعدی"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}