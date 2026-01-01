import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  Receipt,
  Filter,
} from 'lucide-react';
import clsx from 'clsx';
import { backendService } from '../services/backendService';
import { Transaction } from '../types/api';
import { TransactionType } from '../constants/enums';
import { TablePagination } from '../components/ui/TablePagination';
import { TruncatedText } from '../components/ui/Tooltip';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  PaginationState,
} from '@tanstack/react-table';

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch transactions
  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await backendService.getTransactions({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
      });
      setTransactions(response.data);
      setTotalRows(response.meta.total);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions. Please try again.');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [pagination.pageIndex, pagination.pageSize, typeFilter]);

  // Table columns
  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        id: 'type',
        header: 'Type',
        size: 100,
        cell: ({ row }) => {
          const isEarn = row.original.type === TransactionType.EARN;
          return (
            <div
              className={clsx(
                'flex items-center gap-2 text-sm font-medium',
                isEarn ? 'text-emerald-400' : 'text-amber-400',
              )}
            >
              {isEarn ? <TrendingUp className='w-4 h-4' /> : <TrendingDown className='w-4 h-4' />}
              {isEarn ? 'Earn' : 'Redeem'}
            </div>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        size: 150,
        cell: ({ row }) => (
          <span className='text-sm font-medium text-slate-300'>
            {row.original.amount.toLocaleString()} VND
          </span>
        ),
      },
      {
        accessorKey: 'cardId',
        header: 'Card Serial',
        size: 180,
        cell: ({ row }) => (
          <span className='text-sm font-mono text-slate-400'>{row.original.cardId}</span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <TruncatedText
            text={row.original.description}
            lines={2}
            className='text-sm text-slate-400 max-w-[300px]'
          />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        size: 150,
        cell: ({ row }) => (
          <span className='text-sm text-slate-500'>
            {new Date(row.original.createdAt).toLocaleString()}
          </span>
        ),
      },
    ],
    [],
  );

  // React Table instance with manual pagination
  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: totalRows,
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  // Note: searchTerm is currently for UI display only
  // Server-side search could be added later if needed

  return (
    <div className='p-8 h-full flex flex-col gap-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-slate-100'>Transactions</h1>
          <p className='text-slate-400 text-sm'>View all point transactions</p>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={isLoading}
          className='p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50'
        >
          <RefreshCw className={clsx('w-5 h-5', isLoading && 'animate-spin')} />
        </button>
      </div>

      {/* Filters */}
      <div className='flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
          <input
            type='text'
            placeholder='Search by card serial or description...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 text-slate-200'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Filter className='w-4 h-4 text-slate-500' />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as TransactionType | 'ALL');
              setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page
            }}
            className='bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50'
          >
            <option value='ALL'>All Types</option>
            <option value={TransactionType.EARN}>Earn Only</option>
            <option value={TransactionType.REDEEM}>Redeem Only</option>
          </select>
        </div>
        <div className='ml-auto text-sm text-slate-500'>{totalRows} transactions</div>
      </div>

      {/* Data Table */}
      <div className='flex-1 overflow-hidden bg-slate-900 rounded-2xl border border-slate-800 shadow-xl flex flex-col'>
        {/* Loading State */}
        {isLoading && (
          <div className='flex-1 flex flex-col items-center justify-center text-slate-500'>
            <Loader2 className='w-10 h-10 animate-spin mb-4' />
            <p>Loading transactions...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className='flex-1 flex flex-col items-center justify-center text-red-400'>
            <p className='mb-4'>{error}</p>
            <button
              onClick={fetchTransactions}
              className='px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors flex items-center gap-2'
            >
              <RefreshCw className='w-4 h-4' />
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && (
          <>
            <div className='overflow-x-auto flex-1'>
              <table className='w-full'>
                <thead className='bg-slate-900/50 sticky top-0 z-10'>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className='px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800'
                          style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className='py-12'>
                        <div className='flex flex-col items-center justify-center text-slate-500'>
                          <Receipt className='w-12 h-12 mb-4 opacity-50' />
                          <p>No transactions found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className='border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors'
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className='px-4 py-3'>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <TablePagination table={table} totalRows={totalRows} />
          </>
        )}
      </div>
    </div>
  );
};
