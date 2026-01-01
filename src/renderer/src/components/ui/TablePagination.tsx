import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Table } from '@tanstack/react-table';

interface TablePaginationProps<T> {
  table: Table<T>;
  totalRows?: number;
  showPageSize?: boolean;
  pageSizeOptions?: number[];
}

export function TablePagination<T>({
  table,
  totalRows,
  showPageSize = true,
  pageSizeOptions = [5, 10, 20, 50],
}: TablePaginationProps<T>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <div className='border-t border-slate-800 px-4 py-3 flex items-center justify-between bg-slate-900/50'>
      <div className='flex items-center gap-4'>
        {totalRows !== undefined && (
          <span className='text-sm text-slate-500'>{totalRows} total</span>
        )}
        {showPageSize && (
          <div className='flex items-center gap-2'>
            <span className='text-sm text-slate-400'>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className='bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50'
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className='flex items-center gap-1'>
        <span className='text-sm text-slate-400 mr-4'>
          Page {pageIndex + 1} of {pageCount || 1}
        </span>
        <button
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
          className='p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
        >
          <ChevronsLeft className='w-4 h-4' />
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className='p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
        >
          <ChevronLeft className='w-4 h-4' />
        </button>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className='p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
        >
          <ChevronRight className='w-4 h-4' />
        </button>
        <button
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
          className='p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
        >
          <ChevronsRight className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}
