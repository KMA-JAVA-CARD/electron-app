import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Calendar, Mail, CreditCard, Award } from 'lucide-react';
import { UserResponse } from '../types/api';

interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserResponse | null;
}

// Avatar URL builder
const getAvatarUrl = (avatarUrl: string | null): string => {
  if (!avatarUrl) return '';
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `http://localhost:9000${avatarUrl}`;
};

export const UserViewModal = ({ isOpen, onClose, user }: UserViewModalProps) => {
  if (!user) return null;

  const avatarSrc = user.avatarUrl ? getAvatarUrl(user.avatarUrl) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-slate-950/80 backdrop-blur-sm'
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className='bg-slate-900 w-auto rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden'
          >
            <button
              onClick={onClose}
              className='absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors z-10'
            >
              <X className='w-5 h-5' />
            </button>

            {/* Header with gradient */}
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

            {/* Content */}
            <div className='pt-20 px-8 pb-8'>
              <h2 className='text-2xl font-bold text-white mb-1'>{user.fullName}</h2>
              <div className='flex items-center gap-2 mb-6'>
                {user.card ? (
                  <>
                    <span className='px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider border border-emerald-500/20'>
                      {user.card.status}
                    </span>
                    <span className='text-slate-500 text-sm'>ID: {user.card.cardSerial}</span>
                  </>
                ) : (
                  <span className='px-3 py-1 rounded-full bg-slate-700/50 text-slate-400 text-xs font-bold uppercase tracking-wider border border-slate-600'>
                    No Card
                  </span>
                )}
              </div>

              <div className='w-auto grid grid-cols-2 gap-6'>
                {/* Left column */}
                <div className='space-y-4 w-auto'>
                  <div className='flex items-start gap-3'>
                    <Phone className='w-5 h-5 text-slate-500 mt-0.5' />
                    <div>
                      <p className='text-xs text-slate-500 uppercase font-bold'>Phone</p>
                      <p className='text-slate-300'>{user.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <Mail className='w-5 h-5 text-slate-500 mt-0.5' />
                    <div className='flex-1'>
                      <p className='text-xs text-slate-500 uppercase font-bold'>Email</p>
                      <p className='text-slate-300'>{user.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <Calendar className='w-5 h-5 text-slate-500 mt-0.5' />
                    <div>
                      <p className='text-xs text-slate-500 uppercase font-bold'>Date of Birth</p>
                      <p className='text-slate-300'>
                        {user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className='space-y-4'>
                  <div className='flex items-start gap-3'>
                    <MapPin className='w-5 h-5 text-slate-500 mt-0.5' />
                    <div>
                      <p className='text-xs text-slate-500 uppercase font-bold'>Address</p>
                      <p className='text-slate-300'>{user.address || 'N/A'}</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <CreditCard className='w-5 h-5 text-slate-500 mt-0.5' />
                    <div>
                      <p className='text-xs text-slate-500 uppercase font-bold'>Card Serial</p>
                      <p className='text-slate-300 font-mono'>{user.card?.cardSerial || 'N/A'}</p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <Award className='w-5 h-5 text-amber-500 mt-0.5' />
                    <div>
                      <p className='text-xs text-slate-500 uppercase font-bold'>Points Balance</p>
                      <p className='text-amber-400 font-bold'>
                        {user.card?.pointBalance?.toLocaleString() ?? 0} pts
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Join date */}
              <div className='mt-6 pt-4 border-t border-slate-800'>
                <p className='text-xs text-slate-500'>
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
