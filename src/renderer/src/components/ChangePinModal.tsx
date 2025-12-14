import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { Input } from './ui/Input';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPin: string) => void;
  error?: string | null;
  isLoading?: boolean;
}

export const ChangePinModal = ({
  isOpen,
  onClose,
  onSubmit,
  error,
  isLoading,
}: ChangePinModalProps) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNewPin('');
      setConfirmPin('');
      setLocalError(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (newPin.length !== 6) {
      setLocalError('PIN must be exactly 6 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setLocalError('New PINs do not match');
      return;
    }

    onSubmit(newPin);
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
            // onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className='relative bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden'
          >
            {/* Header */}
            <div className='p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50'>
              <h3 className='text-xl font-bold text-slate-100 flex items-center gap-2'>
                <KeyRound className='w-5 h-5 text-blue-500' />
                Change Card PIN
              </h3>
              <button
                onClick={onClose}
                className='p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='p-6 space-y-4'>
              {/* Errors */}
              {(error || localError) && (
                <div className='bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2'>
                  <AlertCircle className='w-4 h-4' />
                  {error || localError}
                </div>
              )}

              <div className='bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-4'>
                <p className='text-sm text-blue-400'>
                  Step 2: Enter the new 6-digit PIN for this card.
                </p>
              </div>

              <Input
                label='New PIN'
                type='password'
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder='Enter new 6-digit PIN'
              />

              <Input
                label='Confirm New PIN'
                type='password'
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder='Re-enter new PIN'
              />

              <div className='pt-2'>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='w-full py-3 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2'
                >
                  {isLoading && <Loader2 className='w-4 h-4 animate-spin' />}
                  Update PIN
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
