import { useState } from 'react';
import { Plus, Search, MoreHorizontal, User, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { RegistrationModal } from '../components/RegistrationModal';

// Mock Data
const MOCK_MEMBERS = [
  {
    id: '1',
    name: 'Sarah Connor',
    email: 'sarah.c@example.com',
    tier: 'Diamond',
    status: 'Active',
    joinDate: '2023-01-15',
    points: 12500,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john.d@example.com',
    tier: 'Gold',
    status: 'Active',
    joinDate: '2023-03-22',
    points: 5400,
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80',
  },
  {
    id: '3',
    name: 'Emily Blunt',
    email: 'emily.b@example.com',
    tier: 'Silver',
    status: 'Expired',
    joinDate: '2022-11-05',
    points: 1200,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
  },
  {
    id: '4',
    name: 'Michael Chen',
    email: 'm.chen@example.com',
    tier: 'Gold',
    status: 'Active',
    joinDate: '2023-06-10',
    points: 8900,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  },
  {
    id: '5',
    name: 'Jessica Davis',
    email: 'jess.d@example.com',
    tier: 'Silver',
    status: 'Active',
    joinDate: '2023-09-01',
    points: 450,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
  },
];

export const MembersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredMembers = MOCK_MEMBERS.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className='p-8 h-full flex flex-col gap-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-slate-100'>Member Management</h1>
          <p className='text-slate-400 text-sm'>Manage memberships and issue cards</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-105 transition-all'
        >
          <Plus className='w-4 h-4' />
          Issue New Card
        </button>
      </div>

      {/* Filters & Search */}
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
        <div className='flex gap-2 ml-auto'>
          {['All', 'Active', 'Expired', 'Silver', 'Gold', 'Diamond'].map((filter) => (
            <button
              key={filter}
              className='px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors'
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className='flex-1 overflow-hidden bg-slate-900 rounded-2xl border border-slate-800 shadow-xl flex flex-col'>
        {/* Table Header */}
        <div className='grid grid-cols-[80px_2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 p-4 border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/50 sticky top-0 z-10'>
          <div>Avatar</div>
          <div>Member Details</div>
          <div>Membership Tier</div>
          <div>Status</div>
          <div>Join Date</div>
          <div>Points</div>
          <div className='text-right'>Actions</div>
        </div>

        {/* Table Body */}
        <div className='overflow-y-auto flex-1'>
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className='grid grid-cols-[80px_2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 p-4 items-center border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group'
            >
              {/* Avatar */}
              <div>
                <img
                  src={member.avatar}
                  alt={member.name}
                  className='w-10 h-10 rounded-full object-cover border border-slate-700'
                />
              </div>

              {/* Details */}
              <div>
                <div className='font-semibold text-slate-200'>{member.name}</div>
                <div className='text-xs text-slate-500'>{member.email}</div>
              </div>

              {/* Tier */}
              <div>
                <span
                  className={clsx(
                    'px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide border',
                    member.tier === 'Diamond'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      : member.tier === 'Gold'
                        ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                        : 'bg-slate-700/30 text-slate-400 border-slate-700',
                  )}
                >
                  {member.tier}
                </span>
              </div>

              {/* Status */}
              <div>
                <span
                  className={clsx(
                    'flex items-center gap-1.5 text-xs font-medium',
                    member.status === 'Active' ? 'text-emerald-400' : 'text-red-400',
                  )}
                >
                  <span
                    className={clsx(
                      'w-1.5 h-1.5 rounded-full',
                      member.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400',
                    )}
                  />
                  {member.status}
                </span>
              </div>

              {/* Join Date */}
              <div className='flex items-center gap-2 text-sm text-slate-400'>
                <Calendar className='w-3.5 h-3.5 text-slate-600' />
                {member.joinDate}
              </div>

              {/* Points */}
              <div className='text-sm font-medium text-emerald-400'>
                {member.points.toLocaleString()} pts
              </div>

              {/* Actions */}
              <div className='text-right'>
                <button className='p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-200 transition-colors'>
                  <MoreHorizontal className='w-4 h-4' />
                </button>
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className='flex flex-col items-center justify-center p-12 text-slate-500'>
              <User className='w-12 h-12 mb-4 opacity-50' />
              <p>No members found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

      <RegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
