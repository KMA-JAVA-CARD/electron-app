import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete } from 'lucide-react';
import clsx from 'clsx';

interface PinInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  title?: string;
  error?: string | null;
  isLoading?: boolean;
  remainingAttempts?: number | null;
}

export const PinInputModal = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'Enter User PIN',
  error,
  isLoading,
  remainingAttempts,
}: PinInputModalProps) => {
  const [pin, setPin] = useState('');
  console.log('remainingAttempts', remainingAttempts);
  useEffect(() => {
    if (isOpen) {
      setPin('');
    }
  }, [isOpen]);

  const handleNumClick = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin.length === 6) {
      onSubmit(pin);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4'>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-slate-950/80 backdrop-blur-sm'
            // onClick={onClose} // Removed per request
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className='relative bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-800 shadow-2xl p-6 flex flex-col items-center'
          >
            <button
              onClick={onClose}
              className='absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition'
            >
              <X className='w-5 h-5' />
            </button>

            <h3 className='text-xl font-bold text-white mb-6'>{title}</h3>

            {/* PIN Display (Masked) */}
            <div className='flex gap-2 mb-8'>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    'w-4 h-4 rounded-full transition-all duration-200',
                    i < pin.length
                      ? 'bg-emerald-500 scale-100 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      : 'bg-slate-800 scale-75',
                  )}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className='mb-4 text-center'>
                <div className='text-red-400 text-sm bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20 animate-pulse'>
                  {error}
                </div>
                {remainingAttempts !== undefined &&
                  remainingAttempts !== null &&
                  remainingAttempts >= 0 && (
                    <p className='text-xs text-amber-500 mt-1 font-mono'>
                      Remaining Attempts: {remainingAttempts}
                    </p>
                  )}
              </div>
            )}

            {/* Numeric Keypad */}
            <div className='grid grid-cols-3 gap-3 w-full mb-6'>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumClick(num.toString())}
                  disabled={isLoading}
                  className='h-14 bg-slate-800 rounded-xl text-xl font-bold text-white hover:bg-slate-700 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50'
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setPin('')}
                disabled={isLoading || pin.length === 0}
                className='h-14 bg-slate-800/50 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all text-sm font-bold disabled:opacity-50'
              >
                CLEAR
              </button>
              <button
                onClick={() => handleNumClick('0')}
                disabled={isLoading}
                className='h-14 bg-slate-800 rounded-xl text-xl font-bold text-white hover:bg-slate-700 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50'
              >
                0
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className='h-14 bg-slate-800/50 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50'
              >
                <Delete className='w-6 h-6' />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={pin.length !== 6 || isLoading || remainingAttempts === 0}
              className='w-full py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
            >
              {isLoading ? 'Verifying...' : 'Submit PIN'}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
