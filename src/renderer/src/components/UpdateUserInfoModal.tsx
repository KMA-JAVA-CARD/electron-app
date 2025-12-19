import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Upload,
  Camera,
  Loader2,
  AlertCircle,
  Save,
} from 'lucide-react';
import clsx from 'clsx';
import { javaCardService } from '../services/javaCardService';
import { backendService } from '../services/backendService';
import { processImageForCard } from '../utils/imageUtils';
import { UpdateMemberRequest, MemberCardResponse } from '../types/api';
import { Input } from './ui/Input';
import { PinInputModal } from './PinInputModal';

interface UpdateUserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string | null;
  currentUserData: MemberCardResponse | null;
  onUpdateSuccess: () => void;
}

// Zod Schema
const updateUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().optional(),
  dob: z.string().optional(),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export const UpdateUserInfoModal = ({
  isOpen,
  onClose,
  cardId,
  currentUserData,
  onUpdateSuccess,
}: UpdateUserInfoModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // PIN verification states
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isPinVerifying, setIsPinVerifying] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<UpdateUserFormData | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      dob: '',
    },
  });

  // Fetch current user data when modal opens
  useEffect(() => {
    const fetchUserData = async () => {
      if (isOpen && cardId) {
        setIsFetchingData(true);
        setGlobalError(null);
        try {
          const userData = await backendService.getMemberInfo(cardId);
          reset({
            fullName: userData.user.fullName || '',
            email: userData.user.email || '',
            phone: userData.user.phone || '',
            address: userData.user.address || '',
            dob: userData.user.dob ? new Date(userData.user.dob).toISOString().split('T')[0] : '',
          });
        } catch (err: any) {
          console.error('Failed to fetch user data:', err);
          setGlobalError('Failed to load user data. Please try again.');
        } finally {
          setIsFetchingData(false);
        }
      }
    };

    fetchUserData();
  }, [isOpen, cardId, reset]);

  const handleClose = () => {
    if (isSubmitting || isPinVerifying) return;
    setAvatarPreview(null);
    setAvatarFile(null);
    setGlobalError(null);
    setPendingFormData(null);
    setIsPinModalOpen(false);
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // RSA Challenge Verification
  const verifyCardChallenge = async (): Promise<boolean> => {
    if (!cardId) return false;

    try {
      const challengeRes = await backendService.getChallenge();
      const signatureRes = await javaCardService.signChallenge(challengeRes.challenge);
      const verifyRes = await backendService.verifyChallenge({
        cardSerial: cardId,
        challenge: challengeRes.challenge,
        signature: signatureRes.result,
      });

      return verifyRes.success;
    } catch (err) {
      console.error('Challenge verification failed:', err);
      return false;
    }
  };

  // PIN Verification Handler
  const handlePinVerification = async (pin: string) => {
    if (!pendingFormData || !cardId) return;

    setIsPinVerifying(true);
    setPinError(null);
    setRemainingAttempts(null);

    try {
      // Step 1: Verify PIN
      const verifyRes = await javaCardService.verifyPin(pin);

      if (verifyRes.sw === '9000' && verifyRes.success) {
        // Step 2: Execute RSA challenge verification
        const challengeVerified = await verifyCardChallenge();

        if (!challengeVerified) {
          setPinError('Security verification failed. Please try again.');
          setIsPinVerifying(false);
          return;
        }

        // Both verifications passed - proceed with update
        setIsPinModalOpen(false);
        await executeUpdate(pin, pendingFormData);
      } else if (verifyRes.sw === '6983' || verifyRes.remainingTries === 0) {
        setPinError('Card is LOCKED! Please use Reset PIN.');
        setRemainingAttempts(0);
      } else if (!verifyRes.success && verifyRes.sw?.startsWith('63c')) {
        setPinError('Incorrect PIN.');
        setRemainingAttempts(verifyRes.remainingTries);
      } else {
        setPinError('Verification failed.');
      }
    } catch (err: any) {
      setPinError(err.message || 'Error verifying PIN');
    } finally {
      setIsPinVerifying(false);
    }
  };

  // Execute the actual update
  const executeUpdate = async (pin: string, data: UpdateUserFormData) => {
    if (!cardId) return;

    setIsSubmitting(true);
    setGlobalError(null);

    try {
      // Step 1: Update card info (name, phone, address, dob)
      await javaCardService.updateCardInfo({
        pin,
        fullName: data.fullName,
        dob: data.dob || '',
        address: data.address || '',
        phone: data.phone,
      });

      // Step 2: Upload avatar to card if provided
      if (avatarFile) {
        const processed = await processImageForCard(avatarFile);
        await javaCardService.uploadCardImage(processed.hex);
      }

      // Step 3: Update backend database
      const updatePayload: UpdateMemberRequest = {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        dob: data.dob || undefined,
        avatar: avatarFile || undefined,
      };

      await backendService.updateUserInfo(cardId, updatePayload);

      // Success
      onUpdateSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Update failed:', err);
      setGlobalError(err.message || 'Failed to update user information');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form submit handler - triggers PIN verification
  const onSubmit = (data: UpdateUserFormData) => {
    setPendingFormData(data);
    setIsPinModalOpen(true);
    setPinError(null);
    setRemainingAttempts(null);
  };

  return (
    <>
      <PinInputModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingFormData(null);
        }}
        onSubmit={handlePinVerification}
        title='Enter PIN to Confirm Update'
        error={pinError}
        isLoading={isPinVerifying}
        remainingAttempts={remainingAttempts}
      />

      <AnimatePresence>
        {isOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='absolute inset-0 bg-slate-950/90 backdrop-blur-md'
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className='relative bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden'
            >
              {/* Header */}
              <div className='bg-gradient-to-r from-emerald-600 to-teal-500 p-6 relative overflow-hidden'>
                <div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")] opacity-20' />
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className='absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white transition-colors disabled:opacity-50'
                >
                  <X className='w-5 h-5' />
                </button>
                <div className='relative'>
                  <h2 className='text-2xl font-bold text-white flex items-center gap-2'>
                    <User className='w-6 h-6' />
                    Update User Information
                  </h2>
                  <p className='text-emerald-100 mt-1'>Update member profile and card data</p>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit(onSubmit)} className='p-6 space-y-6'>
                {/* Loading State */}
                {isFetchingData && (
                  <div className='bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3'>
                    <Loader2 className='w-5 h-5 text-blue-500 animate-spin' />
                    <p className='text-sm text-blue-400'>Loading user data...</p>
                  </div>
                )}

                {/* Global Error */}
                {globalError && (
                  <div className='bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3'>
                    <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
                    <div className='flex-1'>
                      <p className='text-sm text-red-400 font-medium'>{globalError}</p>
                    </div>
                  </div>
                )}

                {/* Avatar Upload */}
                <div className='space-y-3'>
                  <label className='text-sm font-bold text-slate-300 uppercase tracking-wider'>
                    Profile Avatar
                  </label>
                  <div className='flex items-center gap-6'>
                    <div className='relative'>
                      <div
                        className={clsx(
                          'w-24 h-24 rounded-xl overflow-hidden border-2 flex items-center justify-center',
                          avatarPreview ? 'border-emerald-500' : 'border-slate-700 bg-slate-800',
                        )}
                      >
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt='Avatar'
                            className='w-full h-full object-cover'
                          />
                        ) : currentUserData?.user.avatarUrl ? (
                          <img
                            src={currentUserData.user.avatarUrl}
                            alt='Current Avatar'
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <User className='w-10 h-10 text-slate-600' />
                        )}
                      </div>
                      <button
                        type='button'
                        onClick={() => fileInputRef.current?.click()}
                        className='absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-full text-white shadow-lg hover:bg-emerald-600 transition-colors'
                      >
                        <Camera className='w-4 h-4' />
                      </button>
                      <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/*'
                        onChange={handleFileChange}
                        className='hidden'
                      />
                    </div>
                    <div className='flex-1'>
                      <button
                        type='button'
                        onClick={() => fileInputRef.current?.click()}
                        className='flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700'
                      >
                        <Upload className='w-4 h-4' />
                        {avatarFile ? 'Change Photo' : 'Upload New Photo'}
                      </button>
                      <p className='text-xs text-slate-500 mt-2'>
                        JPG, PNG or GIF (max 2MB). Will be resized to 96x96px for card storage.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className='grid grid-cols-2 gap-4'>
                  <div className='col-span-2'>
                    <Input
                      label='Full Name'
                      icon={User}
                      {...register('fullName')}
                      error={errors.fullName?.message}
                      placeholder='John Doe'
                    />
                  </div>

                  <Input
                    label='Email'
                    icon={Mail}
                    type='email'
                    {...register('email')}
                    error={errors.email?.message}
                    placeholder='john@example.com'
                  />

                  <Input
                    label='Phone'
                    icon={Phone}
                    {...register('phone')}
                    error={errors.phone?.message}
                    placeholder='+1 234 567 8900'
                  />

                  <Input
                    label='Date of Birth'
                    icon={Calendar}
                    type='date'
                    {...register('dob')}
                    error={errors.dob?.message}
                  />

                  <Input
                    label='Address'
                    icon={MapPin}
                    {...register('address')}
                    error={errors.address?.message}
                    placeholder='123 Main St, City'
                  />
                </div>

                {/* Submit Button */}
                <div className='flex gap-3 pt-4'>
                  <button
                    type='button'
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className='flex-1 py-3 text-slate-400 hover:bg-slate-800 rounded-xl transition disabled:opacity-50'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2'
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className='w-5 h-5 animate-spin' />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className='w-5 h-5' />
                        Update Information
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
