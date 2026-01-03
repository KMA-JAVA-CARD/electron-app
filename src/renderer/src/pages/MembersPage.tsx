import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  User,
  Calendar,
  Eye,
  Ban,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';
import { RegistrationModal } from '../components/RegistrationModal';
import { UserViewModal } from '../components/UserViewModal';
import { backendService } from '../services/backendService';
import { UserResponse } from '../types/api';
import { Popover, PopoverMenuItem, PopoverDivider } from '../components/ui/Popover';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  PaginationState,
} from '@tanstack/react-table';

// Avatar URL builder
const getAvatarUrl = (avatarUrl: string | null): string => {
  if (!avatarUrl) return '';
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `http://localhost:9000${avatarUrl}`;
};

export const MembersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch users on mount
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await backendService.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Action handlers
  const handleView = (user: UserResponse) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // TODO: Implement block functionality
  // const handleBlock = (user: UserResponse) => {
  //   console.log('Block user:', user);
  // };

  // TODO: Implement delete functionality
  // const handleDelete = (user: UserResponse) => {
  //   console.log('Delete user:', user);
  // };

  // Table columns
  const columns = useMemo<ColumnDef<UserResponse>[]>(
    () => [
      {
        id: 'avatar',
        header: 'Avatar',
        size: 80,
        cell: ({ row }) => (
          <div className='flex items-center justify-center'>
            {row.original.avatarUrl ? (
              <img
                src={getAvatarUrl(row.original.avatarUrl)}
                alt={row.original.fullName}
                className='w-10 h-10 rounded-full object-cover border border-slate-700'
              />
            ) : (
              <div className='w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center'>
                <User className='w-5 h-5 text-slate-500' />
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'fullName',
        header: 'Member Details',
        cell: ({ row }) => (
          <div>
            <div className='font-semibold text-slate-200'>{row.original.fullName}</div>
            <div className='text-xs text-slate-500'>{row.original.email || row.original.phone}</div>
          </div>
        ),
      },
      {
        id: 'cardSerial',
        header: 'Card Serial',
        cell: ({ row }) => (
          <div className='font-mono text-sm text-slate-400'>
            {row.original.card?.cardSerial || (
              <span className='text-slate-600 italic'>No card</span>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.card?.status || 'NO_CARD';
          const isActive = status === 'ACTIVE';
          return (
            <span
              className={clsx(
                'flex items-center gap-1.5 text-xs font-medium',
                isActive
                  ? 'text-emerald-400'
                  : status === 'NO_CARD'
                    ? 'text-slate-500'
                    : 'text-red-400',
              )}
            >
              <span
                className={clsx(
                  'w-1.5 h-1.5 rounded-full',
                  isActive
                    ? 'bg-emerald-400'
                    : status === 'NO_CARD'
                      ? 'bg-slate-600'
                      : 'bg-red-400',
                )}
              />
              {status === 'NO_CARD' ? 'No Card' : status}
            </span>
          );
        },
      },
      {
        id: 'points',
        header: 'Points',
        cell: ({ row }) => (
          <div className='text-sm font-medium text-amber-400'>
            {row.original.card?.pointBalance?.toLocaleString() || 0} pts
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Join Date',
        cell: ({ row }) => (
          <div className='flex items-center gap-2 text-sm text-slate-400'>
            <Calendar className='w-3.5 h-3.5 text-slate-600' />
            {new Date(row.original.createdAt).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className='text-right'>Actions</div>,
        size: 60,
        cell: ({ row }) => (
          <div className='text-right'>
            <Popover
              trigger={
                <button className='p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-200 transition-colors'>
                  <MoreHorizontal className='w-4 h-4' />
                </button>
              }
              align='right'
            >
              <PopoverMenuItem
                icon={<Eye className='w-4 h-4 text-blue-400' />}
                onClick={() => handleView(row.original)}
              >
                View Details
              </PopoverMenuItem>
              {/* TODO: Implement block and delete functionality */}
              {/* <PopoverMenuItem
                icon={<Ban className='w-4 h-4 text-amber-400' />}
                onClick={() => handleBlock(row.original)}
              >
                Block User
              </PopoverMenuItem>
              <PopoverDivider />
              <PopoverMenuItem
                icon={<Trash2 className='w-4 h-4' />}
                onClick={() => handleDelete(row.original)}
                variant='danger'
              >
                Delete
              </PopoverMenuItem> */}
            </Popover>
          </div>
        ),
      },
    ],
    [],
  );

  // React Table instance
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
      globalFilter: searchTerm,
    },
    onGlobalFilterChange: setSearchTerm,
  });

  return (
    <div className='p-8 h-full flex flex-col gap-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-slate-100'>Member Management</h1>
          <p className='text-slate-400 text-sm'>Manage memberships and issue cards</p>
        </div>
        <div className='flex items-center gap-3'>
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className='p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50'
          >
            <RefreshCw className={clsx('w-5 h-5', isLoading && 'animate-spin')} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-105 transition-all'
          >
            <Plus className='w-4 h-4' />
            Issue New Card
          </button>
        </div>
      </div>

      {/* Search */}
      <div className='flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
          <input
            type='text'
            placeholder='Search members by name or email...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 text-slate-200'
          />
        </div>
        <div className='ml-auto text-sm text-slate-500'>
          {table.getFilteredRowModel().rows.length} members
        </div>
      </div>

      {/* Data Table */}
      <div className='flex-1 overflow-hidden bg-slate-900 rounded-2xl border border-slate-800 shadow-xl flex flex-col'>
        {/* Loading State */}
        {isLoading && (
          <div className='flex-1 flex flex-col items-center justify-center text-slate-500'>
            <Loader2 className='w-10 h-10 animate-spin mb-4' />
            <p>Loading members...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className='flex-1 flex flex-col items-center justify-center text-red-400'>
            <p className='mb-4'>{error}</p>
            <button
              onClick={fetchUsers}
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
            {/* Table Header */}
            <div className='overflow-x-auto'>
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
                          <User className='w-12 h-12 mb-4 opacity-50' />
                          <p>No members found</p>
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
            <div className='mt-auto border-t border-slate-800 px-4 py-3 flex items-center justify-between bg-slate-900/50'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-slate-400'>Rows per page:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className='bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50'
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className='flex items-center gap-1'>
                <span className='text-sm text-slate-400 mr-4'>
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
          </>
        )}
      </div>

      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />

      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};
