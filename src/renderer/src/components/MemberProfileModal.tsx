import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  TrendingDown,
  Loader2,
  Receipt,
} from 'lucide-react';
import clsx from 'clsx';
import { MemberCardResponse, SecureInfoResponse, Transaction } from '../types/api';
import { backendService } from '../services/backendService';
import { TransactionType } from '../constants/enums';
import { TablePagination } from './ui/TablePagination';
import { TruncatedText } from './ui/Tooltip';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  PaginationState,
} from '@tanstack/react-table';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberCardResponse | null;
  secureInfo: SecureInfoResponse | null;
}

export const MemberProfileModal = ({
  isOpen,
  onClose,
  member,
  secureInfo,
}: MemberProfileModalProps) => {
  const avatarSrc = member?.user.avatarUrl ?? null;

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // Fetch transactions when modal opens or pagination changes
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isOpen || !member?.cardSerial) return;

      setIsLoadingTransactions(true);
      try {
        const response = await backendService.getTransactions({
          cardSerial: member.cardSerial,
          page: pagination.pageIndex + 1, // API uses 1-based pages
          limit: pagination.pageSize,
        });
        setTransactions(response.data);
        setTotalRows(response.meta.total);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setTransactions([]);
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [isOpen, member?.cardSerial, pagination.pageIndex, pagination.pageSize]);

  // Reset pagination when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPagination({ pageIndex: 0, pageSize: 5 });
      setTransactions([]);
    }
  }, [isOpen]);

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
                'flex items-center gap-1.5 text-xs font-medium',
                isEarn ? 'text-emerald-400' : 'text-amber-400',
              )}
            >
              {isEarn ? (
                <TrendingUp className='w-3.5 h-3.5' />
              ) : (
                <TrendingDown className='w-3.5 h-3.5' />
              )}
              {isEarn ? 'Earn' : 'Redeem'}
            </div>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        size: 120,
        cell: ({ row }) => (
          <span className='text-sm font-medium text-slate-300'>
            {row.original.amount.toLocaleString()} VND
          </span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <TruncatedText
            text={row.original.description}
            lines={2}
            className='text-sm text-slate-400 max-w-[200px]'
          />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        size: 100,
        cell: ({ row }) => (
          <span className='text-xs text-slate-500'>
            {new Date(row.original.createdAt).toLocaleDateString()}
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-slate-950/80 backdrop-blur-sm'
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className='bg-slate-900 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 shadow-2xl relative'
          >
            <button
              onClick={onClose}
              className='absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors z-10'
            >
              <X className='w-5 h-5' />
            </button>

            <div className='relative h-32 bg-gradient-to-r from-emerald-600 to-teal-500'>
              <div className='absolute -bottom-16 left-8 p-1 bg-slate-900 rounded-full'>
                <div className='w-32 h-32 bg-slate-800 rounded-full border-4 border-slate-900 overflow-hidden flex items-center justify-center'>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt='Avatar' className='w-full h-full object-cover' />
                  ) : (
                    <User className='w-16 h-16 text-slate-600' />
                  )}
                </div>
              </div>
            </div>

            <div className='pt-20 px-8 pb-8'>
              <h2 className='text-2xl font-bold text-white mb-1'>
                {member?.user.fullName || secureInfo?.fullName || 'Unknown Member'}
              </h2>
              <div className='flex items-center gap-2 mb-6'>
                <span className='px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider border border-emerald-500/20'>
                  {'Standard'}
                </span>
                <span className='text-slate-500 text-sm'>ID: {member?.cardSerial || 'N/A'}</span>
              </div>

              <div className='grid grid-cols-2 gap-6 mb-8'>
                <div className='space-y-4'>
                  <div className='flex items-start gap-3'>
                    <Phone className='w-5 h-5 text-slate-500 mt-0.5' />
                    <div>
                      <p className='text-xs text-slate-500 uppercase font-bold'>Phone</p>
                      <p className='text-slate-300'>
                        {member?.user?.phone || secureInfo?.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <Calendar className='w-5 h-5 text-slate-500 mt-0.5' />
                    <div>
                      <p className='text-xs text-slate-500 uppercase font-bold'>Date of Birth</p>
                      <p className='text-slate-300'>
                        {secureInfo?.dob || member?.user?.dob?.toString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-start gap-3'>
                    <MapPin className='w-5 h-5 text-slate-500 mt-0.5' />
                    <div>
                      <p className='text-xs text-slate-500 uppercase font-bold'>Address</p>
                      <p className='text-slate-300'>
                        {member?.user?.address || secureInfo?.address || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <Award className='w-5 h-5 text-amber-500 mt-0.5' />
                    <div>
                      <p className='text-xs text-slate-500 uppercase font-bold'>Points</p>
                      <p className='text-amber-400 font-bold'>{member?.pointBalance ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Section */}
              <div className='border-t border-slate-800 pt-6'>
                <div className='flex items-center gap-2 mb-4'>
                  <Receipt className='w-5 h-5 text-slate-400' />
                  <h3 className='text-lg font-bold text-slate-200'>Transaction History</h3>
                </div>

                <div className='bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden'>
                  {isLoadingTransactions ? (
                    <div className='flex items-center justify-center py-8 text-slate-500'>
                      <Loader2 className='w-6 h-6 animate-spin mr-2' />
                      Loading transactions...
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-8 text-slate-500'>
                      <Receipt className='w-10 h-10 mb-2 opacity-50' />
                      <p>No transactions found</p>
                    </div>
                  ) : (
                    <>
                      {/* Table */}
                      <table className='w-full'>
                        <thead className='bg-slate-900/50'>
                          {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                              {headerGroup.headers.map((header) => (
                                <th
                                  key={header.id}
                                  className='px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider'
                                  style={{
                                    width: header.getSize() !== 150 ? header.getSize() : undefined,
                                  }}
                                >
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                      )}
                                </th>
                              ))}
                            </tr>
                          ))}
                        </thead>
                        <tbody>
                          {table.getRowModel().rows.map((row) => (
                            <tr
                              key={row.id}
                              className='border-t border-slate-800/50 hover:bg-slate-800/30 transition-colors'
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className='px-4 py-2.5'>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Pagination */}
                      <TablePagination table={table} totalRows={totalRows} showPageSize={false} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
