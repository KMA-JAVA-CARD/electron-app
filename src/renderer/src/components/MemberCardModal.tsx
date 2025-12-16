import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, User, Leaf } from 'lucide-react';
import { SecureInfoResponse } from '../types/api';
import { hexToImageSrc } from '../utils/imageUtils';
import clsx from 'clsx';

interface MemberCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: () => void;
  secureInfo: SecureInfoResponse | null;
  cardImageHex: string | null;
  cardId: string | null;
}

export const MemberCardModal = ({
  isOpen,
  onClose,
  onViewDetails,
  secureInfo,
  cardImageHex,
  cardId,
}: MemberCardModalProps) => {
  const avatarSrc = cardImageHex ? hexToImageSrc(cardImageHex) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-slate-950/90 backdrop-blur-md'
            // onClick={onClose} // Locked per requirements
          />

          <motion.div
            initial={{ scale: 0.9, rotateY: 90, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            exit={{ scale: 0.9, rotateY: -90, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className='relative w-full max-w-md perspective-1000'
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className='absolute -top-12 right-0 p-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2 group'
            >
              <span className='text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity'>
                Close
              </span>
              <div className='bg-slate-800 p-2 rounded-full border border-slate-700 group-hover:bg-slate-700'>
                <X className='w-5 h-5' />
              </div>
            </button>

            {/* THE CARD */}
            <div className='relative aspect-[1.586/1] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group select-none'>
              {/* Card Background - Dynamic Gradient/Texture */}
              <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950'>
                {/* Decorative Circles */}
                <div className='absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
                <div className='absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2' />

                {/* Carbon Fibre Texture Overlay */}
                <div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")] opacity-30 mix-blend-overlay' />
              </div>

              {/* Card Content */}
              <div className='relative z-10 h-full p-6 flex flex-col justify-between text-white/90'>
                {/* Top Row: Logo & Chip */}
                <div className='flex justify-between items-start'>
                  <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20'>
                      <Leaf className='w-5 h-5 text-white' />
                    </div>
                    <div>
                      <h3 className='font-bold text-lg leading-none tracking-tight text-white'>
                        ZENITH
                      </h3>
                      <p className='text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-semibold'>
                        Wellness
                      </p>
                    </div>
                  </div>
                  {/* Chip Simulation */}
                  <div className='w-12 h-9 rounded-md bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 border border-yellow-700/50 shadow-inner flex items-center justify-center overflow-hidden relative'>
                    <div className='absolute inset-0 border-[0.5px] border-black/20 rounded-md' />
                    <div className='w-full h-[1px] bg-black/20 absolute top-1/2 -translate-y-1/2' />
                    <div className='h-full w-[1px] bg-black/20 absolute left-1/3' />
                    <div className='h-full w-[1px] bg-black/20 absolute right-1/3' />
                  </div>
                </div>

                {/* Middle: Member Info + Avatar */}
                <div className='flex items-center gap-5 mt-4'>
                  <div className='relative'>
                    <div
                      className={clsx(
                        'w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500/50 shadow-lg bg-slate-800 flex items-center justify-center',
                        !avatarSrc && 'bg-slate-900 border-slate-700',
                      )}
                    >
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt='Member Avatar'
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <User className='w-8 h-8 text-slate-600' />
                      )}
                    </div>
                    {/* Status Indicator */}
                    <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center'>
                      <div className='w-2 h-2 bg-white rounded-full animate-pulse' />
                    </div>
                  </div>
                  <div>
                    <p className='text-sm text-emerald-400 mb-2 font-mono'>
                      {cardId ? cardId : '---- ---- ---- ----'}
                    </p>
                    <p className='text-xs text-slate-400 uppercase tracking-wider'>Member Name</p>
                    <div className='flex items-end gap-2'>
                      <h2 className='text-xl font-bold text-white tracking-wide truncate max-w-[200px]'>
                        {secureInfo?.fullName || '---- ----'}
                      </h2>
                      <p className='text-sm text-yellow-400 font-mono'>
                        {/* replace first char '0' with '+84' */}
                        {secureInfo?.phone.startsWith('0')
                          ? `+84${secureInfo?.phone.slice(1)}`
                          : secureInfo?.phone || '---- ---- ---- ----'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Middle Second: Other information: address, date of birth */}
                <div className='flex flex-col gap-1 mt-2'>
                  <div className='flex items-center gap-5'>
                    <p className='text-xs text-slate-400 uppercase w-20 whitespace-nowrap'>
                      DATE OF BIRTH
                    </p>
                    <p className='text-sm font-mono text-slate-300'>
                      {secureInfo?.dob || '--/--/----'}
                    </p>
                  </div>
                  <div className='flex items-center gap-5'>
                    <p className='text-xs text-slate-400 uppercase w-20'>ADDRESS</p>
                    <p className='text-sm font-mono text-slate-300'>
                      {secureInfo?.address || '---- ----'}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Expiry / Tier */}
                <div className='flex justify-between items-end mt-2'>
                  <div>
                    <p className='text-[9px] text-slate-500 uppercase font-bold tracking-widest'>
                      MEMBER SINCE
                    </p>
                    <p className='text-sm font-mono text-slate-300'>2024</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em]'>
                      PLATINUM ACCESS
                    </p>
                  </div>
                </div>
              </div>

              {/* Glossy Reflection Effect */}
              <div className='absolute -inset-[100%] top-0 block bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-[shimmer_3s_infinite]' />
            </div>

            {/* Actions for Details */}
            <div className='mt-8 flex justify-center'>
              <button
                onClick={onViewDetails}
                className='group relative inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-slate-900 font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 overflow-hidden'
              >
                <span className='relative z-10 flex items-center gap-2'>
                  View Full Details{' '}
                  <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                </span>
                <div className='absolute inset-0 bg-gradient-to-r from-emerald-200 via-white to-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
