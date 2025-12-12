import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, RotateCcw, CheckCircle2, Lock } from 'lucide-react';
import clsx from 'clsx';

type ModalState = 'idle' | 'scanning' | 'optimization' | 'verification' | 'pin';

interface CardReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  points: number;
}

export const CardReaderModal = ({ isOpen, onClose, total, points }: CardReaderModalProps) => {
  const [state, setState] = useState<ModalState>('idle');
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (isOpen) {
      setState('idle');
      setPin('');
      // Simulate interactions for demo
      const timer1 = setTimeout(() => setState('scanning'), 2000);
      const timer2 = setTimeout(() => setState('verification'), 4500);
      const timer3 = setTimeout(() => setState('pin'), 7000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen]);

  const handlePinInput = (num: string) => {
    if (pin.length < 4) setPin((prev) => prev + num);
  };

  const handleDeletePin = () => {
    setPin((prev) => prev.slice(0, -1));
  };

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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className='bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col'
          >
            {/* Header */}
            <div className='p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50'>
              <h3 className='text-lg font-semibold text-slate-200'>
                {state === 'idle' && 'Ready to Scan'}
                {state === 'scanning' && 'Reading Card...'}
                {state === 'verification' && 'Member Verified'}
                {state === 'pin' && 'Security Verification'}
              </h3>
              <button
                onClick={onClose}
                className='p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Content Area */}
            <div className='p-8 min-h-[400px] flex flex-col items-center justify-center text-center relative'>
              {/* State: IDLE */}
              {state === 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='flex flex-col items-center'
                >
                  <div className='w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-6 relative'>
                    <CreditCard className='w-16 h-16 text-slate-500' />
                    <motion.div
                      className='absolute -right-4 -top-4 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center'
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <RotateCcw className='w-6 h-6 text-white' />
                    </motion.div>
                  </div>
                  <h2 className='text-xl font-bold text-white mb-2'>Please tap Member Card</h2>
                  <p className='text-slate-400'>
                    Place card on the reader to collect points provided
                  </p>
                </motion.div>
              )}

              {/* State: SCANNING */}
              {state === 'scanning' && (
                <div className='flex flex-col items-center'>
                  <div className='relative w-24 h-24 mb-6'>
                    <div className='absolute inset-0 border-4 border-slate-800 rounded-full'></div>
                    <div className='absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
                  </div>
                  <h2 className='text-lg font-medium text-emerald-400 animate-pulse'>
                    Communicating with Java Card...
                  </h2>
                </div>
              )}

              {/* State: VERIFICATION */}
              {state === 'verification' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='w-full bg-slate-800/50 rounded-2xl p-6 border border-emerald-500/30 flex gap-6 items-center text-left'
                >
                  <img
                    src='https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80'
                    className='w-24 h-24 rounded-xl object-cover border-2 border-emerald-500 shadow-lg shadow-emerald-500/20'
                    alt='Member'
                  />
                  <div>
                    <div className='inline-block px-2 py-1 rounded bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-400/20'>
                      Diamond Member
                    </div>
                    <h2 className='text-2xl font-bold text-white mb-1'>Sarah Connor</h2>
                    <p className='text-slate-400 text-sm'>ID: #9928-1120</p>
                    <div className='mt-2 text-emerald-400 font-medium'>Balance: 12,500 pts</div>
                  </div>
                </motion.div>
              )}

              {/* State: PIN */}
              {state === 'pin' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='w-full max-w-xs'
                >
                  <div className='flex flex-col items-center mb-6'>
                    <div className='w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4'>
                      <Lock className='w-6 h-6 text-emerald-500' />
                    </div>
                    <h3 className='text-white font-medium'>Enter PIN to Confirm</h3>
                    <p className='text-slate-500 text-sm mt-1'>Total: ${total.toFixed(2)}</p>
                  </div>

                  <div className='flex justify-center gap-4 mb-8'>
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={clsx(
                          'w-4 h-4 rounded-full transition-colors duration-200',
                          i < pin.length ? 'bg-emerald-500' : 'bg-slate-700',
                        )}
                      />
                    ))}
                  </div>

                  <div className='grid grid-cols-3 gap-4'>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        onClick={() => handlePinInput(num.toString())}
                        className='h-14 rounded-xl bg-slate-800 hover:bg-slate-700 text-xl font-bold text-white transition-colors'
                      >
                        {num}
                      </button>
                    ))}
                    <div />
                    <button
                      onClick={() => handlePinInput('0')}
                      className='h-14 rounded-xl bg-slate-800 hover:bg-slate-700 text-xl font-bold text-white transition-colors'
                    >
                      0
                    </button>
                    <button
                      onClick={handleDeletePin}
                      className='h-14 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-white transition-colors flex items-center justify-center'
                    >
                      <X className='w-6 h-6' />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
