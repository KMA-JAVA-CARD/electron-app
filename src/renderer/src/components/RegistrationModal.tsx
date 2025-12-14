import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { javaCardService } from '../services/javaCardService';
import { backendService } from '../services/backendService';
import { processImageForCard } from '../utils/imageUtils';
import { RegisterMemberRequest } from '../types/api';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'card-setup' | 'details' | 'complete';
type ConnectionStatus = 'idle' | 'checking' | 'connected' | 'error';

// Zod Schema
const registrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'), // Simplified validation
  tier: z.enum(['Silver', 'Gold', 'Diamond']),
  pin: z.string().length(6, 'PIN must be 6 digits'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export const RegistrationModal = ({ isOpen, onClose }: RegistrationModalProps) => {
  const [step, setStep] = useState<Step>('card-setup');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Separate state for file since RHF handles text better, and file handling is custom UI
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      tier: 'Silver',
      pin: '123456',
    },
  });

  const handleClose = () => {
    if (loadingStep) return;
    setStep('card-setup');
    setConnectionStatus('idle');
    setAvatarPreview(null);
    setAvatarFile(null);
    setLoadingStep(null);
    setGlobalError(null);
    reset();
    onClose();
  };

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      setGlobalError(null);
      await javaCardService.checkConnection();
      const { result: cardId } = await javaCardService.getCardId();

      const isBlank = !cardId || /^0+$/.test(cardId);
      if (isBlank) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('connected');
        setGlobalError(
          `Card is already registered (ID: ${cardId}). Cannot write to an existing card.`,
        );
      }
    } catch (err: any) {
      console.error(err);
      setConnectionStatus('error');
      setGlobalError(err.message || 'Failed to connect to reader.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleNextStep = async () => {
    // Validate nothing for Step 1 -> Step 2, just connection
    if (step === 'card-setup' && connectionStatus === 'connected' && !globalError) {
      setStep('details');
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    if (!avatarFile) {
      setGlobalError('Please upload a member photo.');
      return;
    }

    try {
      setGlobalError(null);

      // Step A: Register Card
      setLoadingStep('Initializing Card (Generating Keys)...');
      const { cardId, modulus: publicKey } = await javaCardService.registerCard(data.pin);
      console.log('Card ID:', cardId);
      console.log('Public Key:', publicKey);
      // Step B: Update Card Info
      setLoadingStep('Writing Personal Data to Card...');
      await javaCardService.updateCardInfo({
        pin: data.pin,
        fullName: `${data.firstName} ${data.lastName}`,
        dob: '2000-01-01',
        address: 'Hanoi',
        phone: data.phone,
      });

      // Step C: Upload Image
      setLoadingStep('Processing & Uploading Avatar to Chip...');
      const { hex } = await processImageForCard(avatarFile);
      await javaCardService.uploadCardImage(hex);

      // Step D: Backend Registration
      setLoadingStep('Syncing with Central Database...');
      const registerRequest: RegisterMemberRequest = {
        cardSerial: cardId,
        publicKey: publicKey,
        fullName: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        email: data.email,
        avatar: avatarFile,
        dob: '2000-01-01',
        address: 'Hanoi',
      };
      await backendService.registerMember(registerRequest);

      setLoadingStep(null);
      setStep('complete');
    } catch (err: any) {
      console.error(err);
      setLoadingStep(null);
      setGlobalError(err.response?.data?.message || err.message || 'Registration failed.');
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
            // onClick={handleClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className='bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]'
          >
            {/* Header and Stepper - Same as before */}
            <div className='p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50'>
              <h3 className='text-xl font-bold text-slate-100 flex items-center gap-2'>
                <Plus className='w-5 h-5 text-emerald-500' />
                Issue New Membership Card
              </h3>
              <button
                onClick={handleClose}
                disabled={!!loadingStep}
                className='p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors disabled:opacity-50'
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

            <div className='p-8 overflow-y-auto relative'>
              {loadingStep && (
                <div className='absolute inset-0 z-10 bg-slate-900/80 flex flex-col items-center justify-center p-8 backdrop-blur-sm'>
                  <Loader2 className='w-12 h-12 text-emerald-500 animate-spin mb-4' />
                  <h4 className='text-xl font-bold text-white mb-2'>Processing...</h4>
                  <p className='text-emerald-400 text-center animate-pulse'>{loadingStep}</p>
                </div>
              )}

              {/* Step 1: Card Setup - Visuals only, no form inputs here */}
              {step === 'card-setup' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className='flex flex-col items-center py-8'
                >
                  {/* Connection Visuals ... Reuse previous code structure for brevity if possible, or fully expand */}
                  <div
                    className={clsx(
                      'w-48 h-32 rounded-xl border-2 flex items-center justify-center mb-8 relative overflow-hidden transition-all duration-500',
                      connectionStatus === 'connected' && !globalError
                        ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : connectionStatus === 'error' || globalError
                          ? 'bg-red-500/10 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                          : 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 shadow-xl',
                    )}
                  >
                    {connectionStatus === 'connected' && !globalError ? (
                      <Wifi className='w-12 h-12 text-emerald-500' />
                    ) : connectionStatus === 'checking' ? (
                      <Loader2 className='w-12 h-12 text-emerald-500 animate-spin' />
                    ) : connectionStatus === 'error' || globalError ? (
                      <AlertCircle className='w-12 h-12 text-red-500' />
                    ) : (
                      <CreditCard className='w-12 h-12 text-slate-400' />
                    )}
                  </div>
                  <h3 className='text-lg font-bold text-white mb-2'>
                    {connectionStatus === 'connected' && !globalError
                      ? 'Reader Connected'
                      : connectionStatus === 'checking'
                        ? 'Checking Connection...'
                        : connectionStatus === 'error' || globalError
                          ? 'Connection Issue'
                          : 'Connect Smart Card Reader'}
                  </h3>
                  <p className='text-slate-400 text-center max-w-sm mb-8'>
                    {connectionStatus === 'connected' && !globalError
                      ? 'Smart card reader is ready and card is blank. You can proceed.'
                      : connectionStatus === 'error' || globalError
                        ? 'Please check: is the reader plugged in? Is the card inserted?'
                        : 'Insert a blank Java Card into the reader. Ensure the chip is facing up.'}
                  </p>

                  {(connectionStatus === 'idle' || connectionStatus === 'error' || globalError) && (
                    <button
                      onClick={checkConnection}
                      className={clsx(
                        'px-8 py-3 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2',
                        connectionStatus === 'error' || globalError
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                          : 'bg-slate-700 hover:bg-slate-600 text-white',
                      )}
                    >
                      {connectionStatus === 'error' || globalError
                        ? 'Retry Connection'
                        : 'Check Connection'}
                    </button>
                  )}

                  {connectionStatus === 'checking' && (
                    <div className='flex items-center gap-2 text-emerald-400 font-medium'>
                      <div className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
                      Establishing secure connection...
                    </div>
                  )}
                  {connectionStatus === 'connected' && !globalError && (
                    <div className='flex items-center gap-2 text-emerald-500 font-bold bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20'>
                      <CheckCircle2 className='w-5 h-5' />
                      Ready to Issue Card
                    </div>
                  )}

                  {globalError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='mt-6 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20 text-sm max-w-md text-center'
                    >
                      <AlertCircle className='w-4 h-4 flex-shrink-0' />
                      {globalError}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Member Details - Form */}
              {step === 'details' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className='space-y-6'
                >
                  {globalError && (
                    <div className='bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2'>
                      <AlertCircle className='w-4 h-4' />
                      {globalError}
                    </div>
                  )}

                  {/* Custom Avatar Upload (Managed outside RHF for simplicity with files) */}
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
                    <p className='text-sm text-slate-500'>Click to upload photo (Required)</p>
                  </div>

                  {/* RHF Inputs */}
                  <div className='grid grid-cols-2 gap-4'>
                    <Input
                      label='First Name'
                      icon={User}
                      placeholder='John'
                      error={errors.firstName?.message}
                      {...register('firstName')}
                    />
                    <Input
                      label='Last Name'
                      icon={User}
                      placeholder='Doe'
                      error={errors.lastName?.message}
                      {...register('lastName')}
                    />
                  </div>

                  <Input
                    label='Email Address'
                    icon={Mail}
                    type='email'
                    placeholder='john.doe@example.com'
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <div className='grid grid-cols-2 gap-4'>
                    <Input
                      label='Phone Number'
                      icon={Phone}
                      type='tel'
                      placeholder='+84 555 000 000'
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                    <Select
                      label='Membership Tier'
                      options={[
                        { label: 'Silver (Standard)', value: 'Silver' },
                        { label: 'Gold (VIP)', value: 'Gold' },
                        { label: 'Diamond (Elite)', value: 'Diamond' },
                      ]}
                      error={errors.tier?.message}
                      {...register('tier')}
                    />
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
                    Card has been issued and member profile created.
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
                  disabled={!!loadingStep}
                  className='px-4 py-2 text-slate-400 hover:text-white transition disabled:opacity-50'
                >
                  Cancel
                </button>
                {step === 'card-setup' ? (
                  <button
                    onClick={handleNextStep}
                    disabled={connectionStatus !== 'connected' || !!globalError}
                    className='px-6 py-2 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Next: Member Details
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={!avatarPreview || !!loadingStep}
                    className='px-6 py-2 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                  >
                    {loadingStep && <Loader2 className='w-4 h-4 animate-spin' />} Issue Card
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
