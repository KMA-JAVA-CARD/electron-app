import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Calendar, Award } from 'lucide-react';
import { MemberCardResponse, SecureInfoResponse } from '../types/api';

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-slate-950/80 backdrop-blur-sm'
            // onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className='bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden'
          >
            <button
              onClick={onClose}
              className='absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors z-10'
            >
              <X className='w-5 h-5' />
            </button>

            <div className='relative h-32 bg-gradient-to-r from-emerald-600 to-teal-500'>
              <div className='absolute -bottom-16 left-8 p-1 bg-slate-900 rounded-full'>
                {/* Avatar Placeholder */}
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

              <div className='grid grid-cols-2 gap-6'>
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
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
