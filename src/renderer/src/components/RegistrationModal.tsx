import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CreditCard,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Plus,
  Upload,
  Camera,
  Loader2,
  AlertCircle,
  Wifi,
} from 'lucide-react';
import clsx from 'clsx';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'card-setup' | 'details' | 'complete';
type ConnectionStatus = 'idle' | 'checking' | 'connected' | 'error';

export const RegistrationModal = ({ isOpen, onClose }: RegistrationModalProps) => {
  const [step, setStep] = useState<Step>('card-setup');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    if (step === 'card-setup' && connectionStatus === 'connected') setStep('details');
    else if (step === 'details') setStep('complete');
  };

  const handleClose = () => {
    setStep('card-setup');
    setConnectionStatus('idle');
    setAvatarPreview(null);
    onClose();
  };

  const checkConnection = () => {
    setConnectionStatus('checking');
    // Simulate connection delay
    setTimeout(() => {
      // Simulate success (can be toggled to 'error' for testing)
      const isSuccess = true;
      setConnectionStatus(isSuccess ? 'connected' : 'error');
    }, 2000);
  };

  const handleMoveToNextStep = () => {
    if (step === 'card-setup' && connectionStatus === 'connected') setStep('details');
    else if (step === 'details') setStep('complete');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
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
            onClick={handleClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className='bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]'
          >
            {/* Header */}
            <div className='p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50'>
              <h3 className='text-xl font-bold text-slate-100 flex items-center gap-2'>
                <Plus className='w-5 h-5 text-emerald-500' />
                Issue New Membership Card
              </h3>
              <button
                onClick={handleClose}
                className='p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Stepper */}
            <div className='flex w-full border-b border-slate-800 bg-slate-950/30'>
              <div
                className={clsx(
                  'flex-1 p-3 text-center text-sm font-medium border-b-2 transition-colors',
                  step === 'card-setup'
                    ? 'border-emerald-500 text-emerald-500'
                    : 'border-transparent text-slate-500',
                )}
              >
                1. Card Setup
              </div>
              <div
                className={clsx(
                  'flex-1 p-3 text-center text-sm font-medium border-b-2 transition-colors',
                  step === 'details'
                    ? 'border-emerald-500 text-emerald-500'
                    : 'border-transparent text-slate-500',
                )}
              >
                2. Member Details
              </div>
              <div
                className={clsx(
                  'flex-1 p-3 text-center text-sm font-medium border-b-2 transition-colors',
                  step === 'complete'
                    ? 'border-emerald-500 text-emerald-500'
                    : 'border-transparent text-slate-500',
                )}
              >
                3. Complete
              </div>
            </div>

            {/* Content */}
            <div className='p-8 overflow-y-auto'>
              {/* Step 1: Card Setup (Previously Step 2) */}
              {step === 'card-setup' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className='flex flex-col items-center py-8'
                >
                  <div
                    className={clsx(
                      'w-48 h-32 rounded-xl border-2 flex items-center justify-center mb-8 relative overflow-hidden transition-all duration-500',
                      connectionStatus === 'connected'
                        ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : connectionStatus === 'error'
                          ? 'bg-red-500/10 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                          : 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 shadow-xl',
                    )}
                  >
                    {connectionStatus === 'connected' ? (
                      <Wifi className='w-12 h-12 text-emerald-500' />
                    ) : connectionStatus === 'checking' ? (
                      <Loader2 className='w-12 h-12 text-emerald-500 animate-spin' />
                    ) : connectionStatus === 'error' ? (
                      <AlertCircle className='w-12 h-12 text-red-500' />
                    ) : (
                      <CreditCard className='w-12 h-12 text-slate-400' />
                    )}
                  </div>

                  <h3 className='text-lg font-bold text-white mb-2'>
                    {connectionStatus === 'connected'
                      ? 'Reader Connected'
                      : connectionStatus === 'checking'
                        ? 'Checking Connection...'
                        : connectionStatus === 'error'
                          ? 'Connection Failed'
                          : 'Connect Smart Card Reader'}
                  </h3>

                  <p className='text-slate-400 text-center max-w-sm mb-8'>
                    {connectionStatus === 'connected'
                      ? 'Smart card reader is ready. You can proceed to member details.'
                      : connectionStatus === 'error'
                        ? 'Unable to detect reader. Please reconnect and try again.'
                        : 'Ensure your Java Card reader is plugged in and the card is inserted correctly.'}
                  </p>

                  {connectionStatus === 'idle' || connectionStatus === 'error' ? (
                    <button
                      onClick={checkConnection}
                      className={clsx(
                        'px-8 py-3 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2',
                        connectionStatus === 'error'
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                          : 'bg-slate-700 hover:bg-slate-600 text-white',
                      )}
                    >
                      {connectionStatus === 'error' ? 'Retry Connection' : 'Check Connection'}
                    </button>
                  ) : connectionStatus === 'checking' ? (
                    <div className='flex items-center gap-2 text-emerald-400 font-medium'>
                      <div className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
                      Establishing secure connection...
                    </div>
                  ) : (
                    <div className='flex items-center gap-2 text-emerald-500 font-bold bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20'>
                      <CheckCircle2 className='w-5 h-5' />
                      Ready to Issue Card
                    </div>
                  )}

                  {connectionStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='mt-6 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20 text-sm'
                    >
                      <AlertCircle className='w-4 h-4' />
                      Error: Device disconnected or driver missing.
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Member Details (Previously Step 1) */}
              {step === 'details' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className='space-y-6'
                >
                  {/* Avatar Upload */}
                  <div className='flex flex-col items-center gap-4'>
                    <div
                      className='w-40 h-40 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 hover:border-emerald-500 flex items-center justify-center cursor-pointer relative overflow-hidden group transition-colors'
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt='Preview'
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='flex flex-col items-center text-slate-500 group-hover:text-emerald-500 transition-colors'>
                          <Camera className='w-6 h-6 mb-1' />
                          <span className='text-[10px] uppercase font-bold'>Upload</span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className='absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                        <Upload className='w-6 h-6 text-white' />
                      </div>
                    </div>
                    <input
                      type='file'
                      ref={fileInputRef}
                      className='hidden'
                      accept='image/*'
                      onChange={handleFileChange}
                    />
                    <p className='text-sm text-slate-500'>Click to upload photo</p>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <label className='text-sm text-slate-400'>First Name</label>
                      <div className='relative'>
                        <User className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
                        <input
                          type='text'
                          className='w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 focus:border-emerald-500 outline-none'
                          placeholder='John'
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm text-slate-400'>Last Name</label>
                      <div className='relative'>
                        <User className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
                        <input
                          type='text'
                          className='w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 focus:border-emerald-500 outline-none'
                          placeholder='Doe'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm text-slate-400'>Email Address</label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
                      <input
                        type='email'
                        className='w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 focus:border-emerald-500 outline-none'
                        placeholder='john.doe@example.com'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <label className='text-sm text-slate-400'>Phone Number</label>
                      <div className='relative'>
                        <Phone className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' />
                        <input
                          type='tel'
                          className='w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 focus:border-emerald-500 outline-none'
                          placeholder='+84 (555) 000-000'
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm text-slate-400'>Membership Tier</label>
                      <select className='w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:border-emerald-500 outline-none appearance-none'>
                        <option>Silver (Standard)</option>
                        <option>Gold (VIP)</option>
                        <option>Diamond (Elite)</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Complete */}
              {step === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='flex flex-col items-center py-8 text-center'
                >
                  <div className='w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6'>
                    <CheckCircle2 className='w-10 h-10 text-emerald-500' />
                  </div>
                  <h2 className='text-2xl font-bold text-white mb-2'>Registration Successful!</h2>
                  <p className='text-slate-400 max-w-sm mb-8'>
                    Card has been issued and member profile created. The member can now use their
                    card for access and payments.
                  </p>
                  <button
                    onClick={handleClose}
                    className='px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition'
                  >
                    Close & Return
                  </button>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {step !== 'complete' && (
              <div className='p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50'>
                <button
                  onClick={handleClose}
                  className='px-4 py-2 text-slate-400 hover:text-white transition'
                >
                  Cancel
                </button>
                <button
                  disabled={
                    (step === 'card-setup' && connectionStatus !== 'connected') ||
                    (step === 'details' && !avatarPreview) // Optional: enforce visual upload
                  }
                  onClick={handleMoveToNextStep}
                  className='px-6 py-2 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {step === 'card-setup' ? 'Next: Member Details' : 'Issue Card'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
